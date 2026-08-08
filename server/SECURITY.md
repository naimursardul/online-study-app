# Server Security Guide

A complete walkthrough of the security layers in this server: what each one does, the
exact code, every piece of syntax explained, how to prove it works, and what breaks if
you get it wrong.

Written to be read start-to-finish once, then used as a reference.

---

## Table of contents

1. [The request pipeline](#1-the-request-pipeline)
2. [Helmet and CORS](#2-helmet-and-cors)
3. [The sanitizer — NoSQL injection](#3-the-sanitizer--nosql-injection)
4. [Rate limiting](#4-rate-limiting)
5. [Validation with zod](#5-validation-with-zod)
6. [Password security](#6-password-security)
7. [HTTPS, proxies, and cookies](#7-https-proxies-and-cookies)
8. [SSRF and path traversal](#8-ssrf-and-path-traversal)
9. [Startup and shutdown safety](#9-startup-and-shutdown-safety)
10. [Full list of changes](#10-full-list-of-changes)
11. [How to verify security work](#11-how-to-verify-security-work)
12. [Lessons and open items](#12-lessons-and-open-items)

---

## 1. The request pipeline

Every request walks through a line of **middleware** before it reaches your controller.
Middleware is just a function that runs on the way in.

```
Request
  ↓
Helmet / CORS      "Are you allowed to talk to us at all?"
  ↓
Sanitizer          "Are you hiding database commands inside your data?"
  ↓
Rate limiter       "Have you asked too many times already?"
  ↓
Validation         "Is your data actually the right shape?"
  ↓
Controller         Business logic — now safe to trust its input
  ↓
Database
```

### Why a middleware is shaped the way it is

```ts
function myMiddleware(req, res, next) {
  // inspect or change req
  next(); // hand off to the next middleware
}
```

Three parameters, always in this order:

| Parameter | What it is                                                   |
| --------- | ------------------------------------------------------------ |
| `req`     | The incoming request — body, query, params, headers, cookies |
| `res`     | The response you send back                                   |
| `next`    | A **function you call** to pass control onward               |

The rule that trips up every beginner: **you either call `next()` or you send a
response — never both, never neither.**

- Forget `next()` and send nothing → the request hangs until the client times out.
- Call `next()` _and_ send a response → Express throws
  `Cannot set headers after they are sent to the client`.

That is why every rejection path in this codebase looks like:

```ts
res.status(400).json({ ... });
return;                        // ← stop here, do NOT fall through to next()
```

The bare `return;` is not decoration. Without it, execution continues to `next()` and
the controller runs on data you just rejected.

### Order is a design decision, not a style choice

This is the single most important idea in this document. Each layer **assumes the layers
before it already did their job**. Three real ordering constraints in this codebase:

**a) The sanitizer must come after the body parsers.**

`express.json()` is what turns the raw bytes of the request into a JavaScript object on
`req.body`. Before it runs, `req.body` is `undefined`. A sanitizer mounted first would
scrub nothing and report success.

**b) The sanitizer must come before the rate limiter.**

The auth limiters read `req.body.phone` to decide _who_ is being limited. If unsanitized
data reached them, the "phone number" used as a key could be an object.

**c) Validation must come after the rate limiter.**

This is the counter-intuitive one, covered in detail in §5. Short version: the limiter
counts attempts. Validation rejects bad input with a `400`. If validation ran first,
malformed requests would be rejected _before being counted_, so an attacker gets
unlimited free attempts by sending slightly-wrong bodies.

### The real wiring

From `src/app.ts`:

```ts
app.set("trust proxy", 1);
app.use(httpsRedirect); // first — don't process what you'll redirect

app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json()); // body parsers must run before sanitizing
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(sanitizeRequest); // after parsers, before limiters

app.get("/", (req, res) => {
  // health check, deliberately above the limiter
  res.json("Hello world! bro");
});

app.use(generalLimiter); // everything below this line is rate limited

app.use("/auth", AuthRouter); // ...routes...

app.use(errorHandler); // LAST — see below
```

Two placement details worth noting.

**The health route sits above `generalLimiter` on purpose.** Render polls `GET /`
constantly to check the service is alive. If those polls consumed the rate limit budget,
your platform's own health checks could get themselves throttled.

**`errorHandler` is mounted last, and takes four parameters.** Express identifies an
error handler purely by its _arity_ — the number of parameters:

```ts
(err, req, res, next) => { ... }   // 4 params → error handler
(req, res, next) => { ... }        // 3 params → normal middleware
```

Drop the unused `next` and Express silently reclassifies it as normal middleware, and
your error handling stops working. Registered last because Express only looks _forward_
for a handler when something throws.

---

## 2. Helmet and CORS

These were already in your code. Understanding them matters because they are the outer
wall, and because CORS is the single most misunderstood piece of web security.

### Helmet

```ts
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
```

Helmet sets a batch of protective HTTP response headers. You are not writing the
protections — you are switching on browser features that already exist:

| Header Helmet sets                | What it stops                                                   |
| --------------------------------- | --------------------------------------------------------------- |
| `X-Content-Type-Options: nosniff` | Browser guessing a file is JavaScript when you said it was text |
| `X-Frame-Options: DENY`           | Your site being embedded in an attacker's iframe (clickjacking) |
| `Strict-Transport-Security`       | Browser ever using plain `http://` for your domain again        |
| `X-DNS-Prefetch-Control`          | Leaking which hosts you talk to                                 |

The one option overridden here, `crossOriginResourcePolicy: "same-site"`, relaxes
Helmet's default of `same-origin`. Your client and API live on different subdomains
(`poruya.com` and the API host) — under the strict default the browser would block
legitimate cross-subdomain resource loads.

### CORS — what it actually does

```ts
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
```

**The most common misconception:** CORS does _not_ stop a server or script from reaching
your API. `curl` ignores CORS entirely — as you saw in every test in this project. CORS
only instructs **browsers** about which web _origins_ may read your responses from
inside a page. It protects your users from a malicious site making authenticated
requests on their behalf; it does not protect your API from direct attackers. That is
what auth and rate limiting are for.

Now the syntax, piece by piece:

**`process.env.ALLOWED_ORIGINS ?? ""`** — `??` is the _nullish coalescing_ operator: use
the left side unless it is `null` or `undefined`. Critically different from `||`, which
also replaces `""`, `0`, and `false`. Here either works, but the habit matters: with
`||`, a legitimately-falsy config value like `PORT=0` would get silently overwritten.

**`.split(",")`** — env vars are always strings, so `"https://a.com,https://b.com"`
becomes `["https://a.com", "https://b.com"]`.

**`.map((origin) => origin.trim())`** — strips whitespace, so a human writing
`"https://a.com, https://b.com"` (with a space after the comma) doesn't produce a broken
entry `" https://b.com"` that silently never matches.

**`.filter(Boolean)`** — a compact idiom worth knowing. `filter` keeps items where the
callback returns truthy; passing the `Boolean` function itself keeps only truthy items.
It removes the empty strings that `split` produces from trailing commas or an empty var.
Equivalent to `.filter((s) => s !== "")` but conventional.

**`credentials: true`** — allows the browser to send cookies with cross-origin requests.
Required for your auth cookie to work at all. This is precisely why the origin list must
be explicit: `origin: "*"` combined with `credentials: true` is rejected outright by
browsers, because it would let _any_ website make authenticated requests as your
logged-in users.

> **Practical note:** if the client ever gets a CORS error in the browser console, check
> `ALLOWED_ORIGINS` on the server first. Origins must match **exactly** — scheme, host,
> and port. `https://poruya.com` and `https://www.poruya.com` are different origins, and
> a trailing slash breaks the match.

---

## 3. The sanitizer — NoSQL injection

### The attack

You may know SQL injection. MongoDB has its own version, and it is arguably easier to
exploit because Mongo queries _are_ JSON — and JSON from a request body can nest.

Your login controller does something like:

```ts
const user = await User.findOne({ phone, isVerified: true });
```

Normally `phone` is `"01712345678"`. But the client controls the request body, and JSON
values don't have to be strings:

```json
{ "phone": { "$ne": null }, "password": { "$ne": null } }
```

Now `phone` is an object, and the query Mongo receives is:

```js
User.findOne({ phone: { $ne: null }, isVerified: true });
```

`$ne` means "not equal". You just asked Mongo for **the first user whose phone is not
null** — an authentication bypass with no password needed. Any key beginning with `$` is
a Mongo _operator_: `$ne`, `$gt`, `$regex`, `$where` (which can execute JavaScript).

The fix: strip `$`-prefixed keys from user input before it reaches the database.

### The Express 5 trap — the most valuable thing in this document

The standard package for this is `express-mongo-sanitize`, and its documentation says:

```ts
app.use(mongoSanitize()); // ← DO NOT DO THIS on Express 5
```

Before touching your code I installed it in a scratch folder and ran it against
Express 5.2.1. **Every single request failed:**

```
Cannot set property query of #<IncomingMessage> which has only a getter
```

Here is why. Internally the package does `req.query = cleanedQuery`. In Express 4 that
was a plain writable property. In **Express 5, `req.query` is a getter-only property** —
assignment throws. Mounting that package as documented would have returned `500` on
100% of your API.

The package's _exported helper function_ is fine, though. So `src/middlewares/sanitize.ts`
uses that directly:

```ts
import { NextFunction, Request, Response } from "express";
import mongoSanitize from "express-mongo-sanitize";

export function sanitizeRequest(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);

  // Express 5's req.query getter re-parses the querystring on every access, so
  // mutating what it returns is a no-op. Redefine it with a sanitized snapshot.
  Object.defineProperty(req, "query", {
    value: mongoSanitize.sanitize({ ...req.query }),
    writable: true,
    configurable: true,
    enumerable: true,
  });

  next();
}
```

### Every line explained

**`_res: Response`** — the underscore prefix is a convention meaning "required by the
signature, deliberately unused". TypeScript's `noUnusedParameters` check specifically
ignores names starting with `_`. Without the underscore you would get a compiler
warning; you cannot simply omit the parameter, because `next` must remain the third
argument for Express to treat this as normal middleware.

**`if (req.body)`** — a guard. On a `GET` request there is no body, and
`sanitize(undefined)` would throw. Note this is exactly the kind of check that only
works because the sanitizer is mounted _after_ `express.json()`.

**`mongoSanitize.sanitize(req.body)`** — mutates the object in place. No reassignment, so
no getter problem. This works for `body` and `params` but _not_ for `query`.

**`Object.defineProperty(req, "query", { ... })`** — the workaround. Two separate
problems are being solved here, and it's worth being precise about both:

1. You cannot write `req.query = x` — the property is getter-only, so assignment throws.
2. You cannot mutate the object `req.query` returns either, because **the getter
   re-parses the querystring on every single access**. Mutate the result and your change
   is discarded the moment anything reads `req.query` again. I verified this behaviour
   directly rather than assuming it.

`Object.defineProperty` sidesteps both by _replacing the property definition itself_ with
a plain value.

**`{ ...req.query }`** — spread syntax, creating a shallow copy. Reads the getter once
and captures a snapshot to sanitize, instead of fighting the re-parsing getter.

**The three descriptor flags** are not boilerplate; each has a reason:

| Flag                 | Meaning                                               | Why it's needed                                                                                                  |
| -------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `writable: true`     | Value can be reassigned later                         | So `validate.ts` can replace `query` with its parsed version                                                     |
| `configurable: true` | The property can be redefined again                   | Without this, `validate.ts`'s later `defineProperty` throws `TypeError: Cannot redefine property`                |
| `enumerable: true`   | Shows up in `Object.keys()`, spread, `JSON.stringify` | Matches normal property behaviour; without it, code that iterates the request object would silently skip `query` |

All three default to `false` when omitted, which is precisely the bug you'd hit if you
wrote this from memory and left them out.

### A nuance I found while testing

Express 5's default query parser (`simple`) flattens `?search[$ne]=x` into a literal key
`"search[$ne]"` — not a nested object. So query-string operator injection **wasn't
actually reachable** on this setup. The request body was the real vector.

The sanitizer covers both anyway, which is correct — defence shouldn't depend on a
parser default that a future config change could flip. But it's a good reminder to
verify your model of an attack rather than assume it.

### Verify it

```bash
# 1. The app still works at all — this is the Express 5 trap.
curl -s -o /dev/null -w "%{http_code}\n" localhost:5000/subject
# → 200.  A 500 with "Cannot set property query" means middleware() got used.

# 2. Operators are stripped from bodies.
curl -s -X POST localhost:5000/auth/login-with-phone \
  -H "Content-Type: application/json" \
  -d '{"phone":{"$ne":null},"password":{"$ne":null}}'
# → 400 Validation failed.  NOT a successful login.
```

That second command is the canonical NoSQL auth bypass. Run it against any Node/Mongo
API you build. **Verified on this server: it returns a clean `400`, not a session.**

### What breaks if you get it wrong

| Mistake                               | Symptom                                                |
| ------------------------------------- | ------------------------------------------------------ |
| Using `mongoSanitize()` as middleware | Every request → `500`. Total outage.                   |
| Mounting before `express.json()`      | Silent no-op. Bodies never sanitized, no error.        |
| Mounting after the rate limiter       | Limiter keys on unsanitized input.                     |
| Omitting `configurable: true`         | `validate.ts` crashes with `Cannot redefine property`. |
| Mutating `req.query` directly         | Silent no-op — the getter re-parses and discards it.   |

---

## 4. Rate limiting

Rate limiting caps how many requests one person can make in a time window. Without it,
an attacker can try 10,000 passwords a minute, or drain a paid AI budget.

### The store: where counts are remembered

A limiter has to _remember_ how many times you've asked. Where it remembers is the whole
design decision:

| Store                | How it works                         | Problem                                                                              |
| -------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| **Memory** (default) | Counts in your server's RAM          | Restart → counts reset. Two servers → each counts separately, so real limits double. |
| **Redis** (this app) | Counts in a shared external database | Survives restarts, shared across all instances.                                      |

Redis is the production-correct choice. But it introduces the question that turned out to
be the most serious issue in the original code.

### The critical question: what if Redis is down?

Your limiter asks Redis "how many times has this person asked?" If Redis can't answer,
there are exactly two possible behaviours:

- **Fail open** — allow the request through, unprotected. _Site up, protection off._
- **Fail closed** — reject the request. _Protected, but the feature is down._

There is no third option. You must consciously choose per route.

**The hybrid chosen here:**

| Limiter                       | Behaviour       | Reasoning                                                           |
| ----------------------------- | --------------- | ------------------------------------------------------------------- |
| `generalLimiter` (all routes) | fail **open**   | A Redis blip must not take the whole site down                      |
| `enhanceLimiter`              | fail **open**   | Availability over protection on a normal feature                    |
| All auth limiters             | fail **closed** | A Redis outage must never become an open door for password guessing |

That is the `passOnStoreError` option — and its default is `false` (fail closed) for
_everything_. The original code never set it, so a Redis hiccup meant **500 errors on
every auth and image request**. Library defaults are a decision someone else made for
you; always check them.

### The bug that hid everything: it wasn't running

When the app was split into `index.ts` (startup) and `app.ts` (the Express app), this line
was lost in the move:

```ts
app.use(generalLimiter);
```

`createGeneralLimiter()` existed, was correct, and had **zero callers**. Every route
except five was completely unlimited.

**How to catch this yourself** — limiters announce themselves in response headers:

```bash
curl -i localhost:5000/subject | grep -i ratelimit
# → RateLimit-Policy: 300;w=900     ✓ mounted
# → (nothing)                       ✗ not mounted, no matter how good the code looks
```

**Test the behaviour, not the code.** This is the lesson that generalises furthest.

### Keying: who counts as "one user"?

A limiter groups requests by a _key_. The original code keyed on IP, which seems obvious
but was wrong for your users.

In Bangladesh, mobile carriers use **CGNAT** — thousands of phones share a handful of
public IPs. With a 5-per-15-minutes IP limit, five users on Grameenphone could lock out
an entire carrier.

From `src/middlewares/rate-limit.ts`:

```ts
// IPv6 must go through ipKeyGenerator so a single /64 can't be rotated for free.
function ipKey(req: Request) {
  return req.ip ? ipKeyGenerator(req.ip) : "unknown";
}

// Keying auth attempts by phone instead of IP: this app's users are largely on
// BD mobile carriers, where a whole CGNAT pool shares one IP.
function phoneKey(req: Request) {
  const phone = String(req.body?.phone ?? "").trim();
  return phone || ipKey(req);
}
```

**`ipKeyGenerator(req.ip)`** — not cosmetic. An IPv6 user is typically assigned a `/64`
block containing about 18 _quintillion_ addresses. Key on the raw address and they rotate
for free, forever. The helper groups the whole block into one key. Always use it when
keying on IP.

**`req.body?.phone`** — optional chaining. If `req.body` is `undefined`, the whole
expression is `undefined` instead of throwing `Cannot read property 'phone' of undefined`.

**`String(...)`** — defensive coercion. Even though the sanitizer runs first, a key must
be a string; this guarantees it regardless of what arrives.

**`phone || ipKey(req)`** — the fallback. If no phone was sent (empty string, which is
falsy), fall back to IP so a request is _never_ unkeyed. An unkeyed request is an
unlimited request. Note `||` is correct here, unlike in the CORS example, because empty
string genuinely should trigger the fallback.

### Two layers per route

```ts
router.post(
  "/login-with-phone",
  authIpLimiter, // 30 per IP  — one machine can't spray many phones
  loginLimiter, //  8 per phone — can't guess one account's password
  validate(loginWithPhoneSchema),
  loginWithPhone,
);
```

Neither layer alone suffices. Phone-only lets an attacker try 8 passwords against 10,000
accounts. IP-only locks out legitimate CGNAT users. Together they cover both.

### The subtle counting bug

`skipSuccessfulRequests: true` means "only count failures". Correct for _login_ —
legitimate users shouldn't burn budget by logging in successfully.

But it was also on `sendOtp`, and **`sendOtp` writes a database row every time it
succeeds**. Successes weren't counted, so one attacker could create unlimited user
records for free.

```ts
export const sendOtpLimiter = failClosed(
  rateLimit({
    ...common,
    store: createStore("otp:"),
    keyGenerator: phoneKey,
    limit: 3,
    passOnStoreError: false,
    // NO skipSuccessfulRequests — each success writes a User row
  }),
);
```

**The rule: `skipSuccessfulRequests` is only safe when success is cheap.** If success
costs money, storage, or an SMS, you must count it.

**`...common`** — spread syntax again, this time for config reuse. `common` holds
`windowMs`, header settings, and the shared handler, so every limiter stays consistent
and a change happens in one place. Properties listed _after_ the spread override it —
which is how each limiter sets its own `limit`.

### The hanging-request bug (found during testing)

While testing, your Redis host had a DNS blip and requests started hanging for **30–60
seconds** instead of failing fast.

The reason is subtle. `disableOfflineQueue: true` makes commands fail instantly when the
socket is **fully closed**. But while the socket is merely _slow_ or _mid-reconnect_,
commands sit and wait. The fail-open logic never ran, because nothing ever errored — it
just hung. **Fail-open only helps if the failure actually arrives.**

The fix is a per-command timeout:

```ts
function createStore(prefix: string) {
  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) =>
      redisClient.sendCommand(args, { timeout: REDIS_COMMAND_TIMEOUT_MS }),
  });
}
```

**`(...args: string[])`** — rest parameters, collecting any number of arguments into an
array. The store calls `sendCommand("INCR", "key")` with separate arguments, while
node-redis wants a single array — the rest parameter converts between the two.

> **A real gotcha worth internalising.** I first set `commandOptions: { timeout: 1000 }`
> on the client itself. TypeScript accepted it. It compiled cleanly. **It did nothing.**
> node-redis only honours `timeout` per-command. I found this only by _timing an actual
> command_. The types lied. When something safety-critical "should work", measure it.

Result: with Redis fully unreachable, fail-open responds in **72ms** and fail-closed in
**69ms**, instead of hanging 30+ seconds.

### Clean errors: the `failClosed` wrapper

When a fail-closed limiter rejected, the raw error `"The client is closed"` was reaching
the user — leaking internals. This wrapper converts it:

```ts
function failClosed(limiter: RequestHandler): RequestHandler {
  return (req, res, next) => {
    limiter(req, res, (err?: unknown) => {
      if (!err) return next();
      console.error("Rate limiter store unavailable:", err);
      res.status(503).json({
        success: false,
        message: "Service temporarily unavailable. Please try again shortly.",
      });
    });
  };
}
```

**`(limiter: RequestHandler): RequestHandler`** — takes a middleware, returns a
middleware. `RequestHandler` is Express's built-in type for `(req, res, next) => void`,
imported from `express`. Using the library's type instead of hand-writing the signature
means your wrapper stays compatible if Express changes.

**The clever part:** instead of passing the real `next`, we pass _our own function_ as
`next`. The limiter calls it either way — with no argument on success, or with an error
on failure. That lets us intercept the failure. Express's convention is that
`next(anything)` means "this is an error, skip to the error handler"; here we catch it
before it gets there.

**`err?: unknown`** — `unknown` is the honest type for a caught error. Unlike `any`, it
forces you to narrow before use. In modern JS you can `throw` literally anything, so
`unknown` is correct.

**`if (!err) return next();`** — `return` here is just an early exit, not a returned
value.

**The two-audience split:** `console.error` gets the real error for your logs;
`res.json` gets a generic message. **Detailed errors to logs, generic messages to
users** — error text is free reconnaissance for an attacker.

**Why `503` and not `429`?** `429 Too Many Requests` would be a lie — the user did
nothing wrong. `503 Service Unavailable` correctly says "our problem, try again", and
well-behaved clients know to retry it.

### Verify it

```bash
# Limits trigger at the right number (login limit is 8):
for i in $(seq 1 9); do
  curl -s -o /dev/null -w "%{http_code} " -X POST localhost:5000/auth/login-with-phone \
    -H "Content-Type: application/json" \
    -d '{"phone":"01655000077","password":"wrongpass1"}'
done
# → 400 400 400 400 400 400 400 400 429    exactly 8 then blocked ✓

# Per-phone isolation — a different phone must NOT be blocked:
curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:5000/auth/login-with-phone \
  -H "Content-Type: application/json" -d '{"phone":"01655000042","password":"x"}'
# → 400, not 429 ✓
```

Both verified on this server. The second check is the one people forget: it proves you
limited _an account_ rather than accidentally limiting _everyone_.

---

## 5. Validation with zod

### The problem

The original controllers checked input like this:

```ts
if (!phone || phone.length !== 11) {
  /* reject */
}
```

Three problems: it repeats in every controller, it's easy to forget a field, and it only
checks _truthiness_ — `phone` could be an object, an array, or a Mongo operator.

### The solution: validate before the controller

From `src/middlewares/validate.ts`:

```ts
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodType } from "zod";

type ValidatedRequest = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
};

export function validate(schema: ZodType<ValidatedRequest>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          path: issue.path.slice(1).join(".") || issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    if (result.data.body !== undefined) req.body = result.data.body;
    if (result.data.params !== undefined) {
      req.params = result.data.params as Request["params"];
    }
    if (result.data.query !== undefined) {
      Object.defineProperty(req, "query", {
        value: result.data.query,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    next();
  };
}
```

### Every line explained

**`export function validate(schema): RequestHandler`** — this is a **higher-order
function**: a function that returns a function. Why it matters: `app.use()` needs a
middleware, but each route needs a _different_ schema. Calling `validate(mySchema)`
returns a middleware that has captured that schema in its closure.

```ts
router.post("/send-otp", validate(sendOtpSchema), sendOtp);
router.post(
  "/login-with-phone",
  validate(loginWithPhoneSchema),
  loginWithPhone,
);
```

One implementation, configured per route.

**`type ValidatedRequest = { body?: unknown; ... }`** — the `?` marks each key optional,
because a schema might validate only `body`, or only `params`. `unknown` rather than
`any` is deliberate: `unknown` is the type of "a value I haven't checked yet", which is
exactly what unvalidated input is.

**`schema.safeParse({...})`** — the most important choice in this file. Zod gives you
two methods:

| Method        | On failure                          |
| ------------- | ----------------------------------- |
| `parse()`     | **throws** an exception             |
| `safeParse()` | returns `{ success: false, error }` |

Inside a request handler you want to _control the response_, not throw. `safeParse` lets
you return a clean `400`. This pattern — a result object instead of an exception — is
called a discriminated union, and TypeScript understands it: after
`if (!result.success)`, TypeScript knows `result.error` exists inside the block and
`result.data` exists after it. No casting needed.

**`result.error.issues`** — zod **v4** (4.4.3 here) exposes problems as `.issues`. Note
that v3 tutorials use `.format()` or `.flatten()`. If you copy from an older blog post it
won't compile. Always check your installed major version.

**`.map((issue) => ({ path, message }))`** — reshapes zod's verbose internal issue
objects into the minimal `{ path, message }` your client needs. The extra parentheses in
`=> ({ ... })` are required: without them JavaScript reads `{` as a function _body_
rather than an object literal, and the function silently returns `undefined`. A genuinely
common bug.

**`issue.path.slice(1).join(".")`** — cosmetic but worth understanding. Because the schema
is wrapped as `{ body: {...} }`, zod reports the path as `["body", "password"]`. Nobody
sent a field called "body" — they sent `password`. `.slice(1)` drops the wrapper segment,
`.join(".")` turns the remainder into `"password"` (or `"answers.0.questionId"` for
nested fields).

**`|| issue.path.join(".")`** — the fallback for when the error is on the wrapper itself.
If a client sends an unknown top-level key, the path is just `["body"]`; `.slice(1)` would
leave an empty string, so we fall back to the full path. That's why the real output for a
rejected unknown key reads `"path": "body"`.

**Writing parsed values back** — the step people skip:

```ts
if (result.data.body !== undefined) req.body = result.data.body;
```

Zod doesn't only validate, it **transforms**: `.trim()` removes whitespace, coercion
turns `"5"` into `5`, and `.strict()` strips unknown keys. Skip this assignment and your
controller receives the _raw_ input, losing every one of those benefits. Note the check is
`!== undefined` rather than a truthy check — an empty object `{}` is falsy-adjacent in
sloppy code but is a perfectly valid parsed body.

**`as Request["params"]`** — a type assertion. `Request["params"]` is _indexed access
type_ syntax: "whatever type the `params` property of `Request` has". Express types
`params` narrowly; zod returns a plain object. The assertion tells the compiler we know
they're compatible. Using the indexed type rather than hand-writing it means the code
stays correct if Express changes its definition.

**`Object.defineProperty` for query** — same Express 5 getter problem from §3. This also
explains why `sanitize.ts` needed `configurable: true`: this file redefines the property
a _second_ time, which is only legal if the first definition allowed it.

### `.strict()` — the hidden superpower

Six update routes did this:

```ts
const updatedData = req.body; // whatever the client sent
await Background.findByIdAndUpdate(id, updatedData); // straight into the database
```

Whatever JSON arrives becomes a database update. This class of bug is called **mass
assignment**. On a user route it means `{"role": "admin"}` — instant self-promotion.

From `src/validations/crud.validation.ts`:

```ts
const updateBody = <T extends z.ZodRawShape>(shape: T) =>
  z.object({
    params: z.object({ id: objectId }),
    body: z.object(shape).partial().strict(),
  });

export const backgroundUpdateSchema = updateBody({
  name,
  levelId: objectId,
});
```

**`<T extends z.ZodRawShape>`** — a **generic type parameter**. `T` is a placeholder for
"whatever shape gets passed in", and `extends z.ZodRawShape` constrains it to a valid zod
shape object. The payoff: the returned schema is typed _specifically_ for the fields you
passed, so `backgroundUpdateSchema` knows about `name` and `levelId` exactly. A
non-generic version typed as `z.ZodObject<any>` would validate correctly at runtime but
give you no autocomplete and no compile-time checking.

**`.partial()`** — makes every field optional. Correct for `PATCH`/`PUT`-style updates
where a client sends only the fields it's changing. Without it, every update would have to
include every field.

**`.strict()`** — the security-critical one. By default zod **silently strips** unknown
keys. `.strict()` makes it **reject** them with an error instead.

Why reject rather than strip? Stripping is safe but silent — a client sending `role` would
get a `200` and believe it worked. Rejecting surfaces the mistake immediately, which
catches both attacks and honest client-side typos.

Verified live:

```
PUT /background/:id  {"name":"Science","role":"admin","__proto__x":"y"}
→ 400 {"errors":[{"path":"body","message":"Unrecognized keys: \"role\", \"__proto__x\""}]}

PUT /background/:id  {"name":"Science"}
→ 200 {"success":true,"message":"Background updated successfully."}
```

**Rule: never pass `req.body` directly to a database update. Always whitelist.**

### Shared primitives

From `src/validations/common.ts`:

```ts
export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid id");
export const safeSearch = z.string().trim().min(1).max(100);
export const phone = z
  .string()
  .regex(/^01\d{9}$/, "Phone must start with 01 and be 11 digits");
```

**`objectId`** — a Mongo ObjectId is exactly 24 hexadecimal characters. `^` anchors the
start, `$` the end; without both, `"garbage" + validId` would pass. Validating this shape
turns a confusing `500` (Mongo cast error) into a clear `400`.

**`safeSearch`** — `.max(100)` is a real security control, not just tidiness. Search terms
land in `{ $regex: search }`, and an unbounded pattern enables **ReDoS**: a crafted regex
like `(a+)+$` can take exponential time, pinning your CPU at 100% from one request.
Bounding the length bounds the damage.

**`phone`** — `\d` is any digit, `{9}` means exactly nine, so with the literal `01` prefix
that's 11 characters. The second argument to `.regex()` is the message users actually see,
which is why it's phrased in plain language rather than showing the pattern.

Defining these once means the rule is consistent everywhere and changes in one place.

### The ordering trap: validation comes AFTER rate limiting

```ts
router.post(
  "/login-with-phone",
  authIpLimiter,
  loginLimiter, // 1. count the attempt
  validate(loginWithPhoneSchema), // 2. then check the shape
  loginWithPhone,
);
```

Why not validate first? It feels wrong to run expensive work on malformed input.

Because `loginLimiter` counts **per phone number**, reading `req.body.phone`. If
validation ran first, an attacker could send deliberately malformed bodies — rejected with
`400` _before the limiter ever counted them_ — and then guess passwords for free. The
counter never moves.

**The general principle: ask what each middleware needs to have already happened.** The
limiter needs the raw body. Validation needs nothing. So the limiter goes first.

### Verify it

```bash
# Clear field-level errors instead of a crash:
curl -s -X POST localhost:5000/auth/send-otp \
  -H "Content-Type: application/json" -d '{"phone":"123"}'
```

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "path": "phone", "message": "Phone must start with 01 and be 11 digits" },
    {
      "path": "password",
      "message": "Invalid input: expected string, received undefined"
    }
  ]
}
```

Note it reports **both** problems at once, rather than failing on the first. Much better
for a client building a form UI.

That second error also fixes a real bug: `sendOtp` called
`bcryptjs.hash(password, 10)` without checking `password` existed. A missing password
threw inside bcrypt and surfaced as a confusing generic error. Now it's a clear `400`.

```bash
# Bad ObjectId → clean 400 instead of a Mongo cast 500:
curl -s "localhost:5000/subject?levelId=notanid"
# → {"errors":[{"path":"levelId","message":"Must be a valid id"}]}
```

### What breaks if you get it wrong

| Mistake                                          | Symptom                                              |
| ------------------------------------------------ | ---------------------------------------------------- |
| `parse()` instead of `safeParse()`               | Throws; error handler returns `500` instead of `400` |
| Forgetting to write parsed values back           | No trimming, no coercion, `.strict()` stripping lost |
| `=> { ... }` instead of `=> ({ ... })` in `.map` | Silently returns `undefined`                         |
| Using v3's `.format()` on zod v4                 | Compile error                                        |
| Validation before the rate limiter               | Attacker gets unlimited uncounted attempts           |
| Omitting `.strict()`                             | Unknown keys silently accepted                       |

---

## 6. Password security

### What was already correct

Credit where due — the hashing itself was right:

```ts
const hashedPassword = await bcryptjs.hash(password, 10);
const isMatch = await bcryptjs.compare(password, user.password);
```

**`bcryptjs.hash(password, 10)`** — `10` is the _salt rounds_ (cost factor). It's
logarithmic: 10 means 2¹⁰ = 1024 internal iterations. That deliberate slowness is the
point — it makes brute-forcing a stolen database expensive. 10 is the accepted minimum
today; 12 is stronger but noticeably slower per login.

bcrypt also handles **salting** automatically. A salt is random data mixed into each hash
so two users with the same password get different hashes — which is what defeats
precomputed "rainbow table" attacks. You'll notice the salt is stored inside the hash
string itself, which is why `compare` doesn't need it passed separately.

**`bcryptjs.compare(password, user.password)`** — argument order matters: plaintext
first, stored hash second. Reversed, it always returns `false` and every login fails.
Also note you can never "decrypt" a bcrypt hash — you can only hash the attempt again and
compare. That's why a password reset flow issues a _new_ password rather than recovering
the old one.

Your JWT was also well designed:

```ts
// utils/jwt-token.ts — payload contains only:
{
  (userId, role, userCategory);
}
```

No password, no full document. And `role` is **re-read from the database on every
request** rather than trusted from the token — exactly right. A token issued before a
demotion must not keep admin rights. Remember that a JWT is _signed, not encrypted_:
anyone can read its contents by base64-decoding it. Never put a secret in one.

### The bug: hashes were sent to the client

Three public endpoints returned the full user document. Captured from a real
unauthenticated request:

```json
{
  "success": true,
  "message": "Login successful",
  "user": { "phone": "...", "password": "$2b$10$.9.PQ3VFPoj8j..." }
}
```

Your bcrypt hash, handed to anyone who logs in. `loginWithPhone` even had this comment
directly above the leaking line:

```ts
// ✅ Send response (never send password)
res.status(200).json({ success: true, user }); // ← sends the password
```

**A comment describing a guarantee is not the same as code enforcing it.**

### Why it leaked

Mongoose returns every schema field by default. The schema said:

```ts
password: { type: String },
```

Nothing marked it secret, so `res.json(user)` serialized it. Worth being clear about the
severity: bcrypt is strong, so this is not instantly game-over. But it hands an attacker
an _offline_ target — they can crack it at their own pace with no rate limiting, and
people reuse passwords across sites.

### The fix: secure by default

We could have patched the three responses. Instead we fixed it at the **model** layer, so
future code is safe automatically. From `src/models/user-model.ts`:

```ts
password:          { type: String, select: false },
verificationToken: { type: String, select: false },
resetToken:        { type: String, select: false },
```

**`select: false`** means "never include this field unless explicitly asked". Now _every_
query is safe by default — including endpoints you write next year.

Then opt back in at the one place that genuinely needs it, in `loginWithPhone`:

```ts
const user = await User.findOne({ phone, isVerified: true, provider: "phone" })
  .select("+password")
  .populate("level", "name");

// ...after bcryptjs.compare succeeds:
const { password: _hash, ...safeUser } = user.toObject();
res.status(200).json({ success: true, user: safeUser });
```

**`.select("+password")`** — the `+` prefix means "add this back to the default
selection". Without the `+`, `.select("password")` would mean "return _only_ password",
dropping every other field.

**`const { password: _hash, ...safeUser } = user.toObject()`** — destructuring with a
rename plus rest. `password: _hash` pulls the hash into a variable named `_hash` (the
underscore signalling deliberate non-use), and `...safeUser` collects **everything else**.
The result is a copy with the hash removed — belt-and-braces alongside `select: false`.

**`.toObject()`** — required. A Mongoose document is a special object with internal
tracking state; spreading it directly would copy that machinery instead of your data.
`.toObject()` converts it to a plain JavaScript object first.

We also removed `console.log(user)` from `verifyOtp` — it was writing password hashes into
your server logs. **Logs are a genuine leak vector**: they get shipped to third-party
monitoring services, pasted into bug reports, screenshotted, and retained for years.

> **The principle — secure by default.** Compare the two designs: with `select: false`,
> forgetting to think about passwords is _safe_. Without it, forgetting is a _breach_.
> Always make the safe path the automatic one and the unsafe path require explicit opt-in.

### Verify it — including the regression

```bash
# 1. The hash is gone:
curl -s -X POST localhost:5000/auth/login-with-phone \
  -H "Content-Type: application/json" \
  -d '{"phone":"01655000077","password":"testpass123"}' | grep -c '"password"'
# → 0 ✓

# 2. Login STILL WORKS — the step people skip:
curl -s -X POST localhost:5000/auth/login-with-phone \
  -H "Content-Type: application/json" \
  -d '{"phone":"01655000077","password":"testpass123"}'
```

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "...",
    "role": "user",
    "userCategory": "regular",
    "isVerified": true,
    "phone": "...",
    "lastLogin": "..."
  }
}
```

Complete user object with `role` intact, no `password`. **Step 2 matters most.** If
`.select("+password")` were missing, `compare()` would receive `undefined` and _every
login on the site would fail_. A security fix that breaks authentication is not a fix.

No client change was needed — the frontend only reads `user.role`, `user.level`, and
`user.background`, which I checked before making the change.

---

## 7. HTTPS, proxies, and cookies

### HTTPS redirect

HTTP traffic is readable by anyone on the network path — coffee shop wifi, ISP, hotel
router. If a user hits `http://`, bounce them to `https://`.

From `src/middlewares/https-redirect.ts`:

```ts
const isProduction = process.env.NODE_ENV === "production";

export function httpsRedirect(req: Request, res: Response, next: NextFunction) {
  if (!isProduction || req.secure) {
    next();
    return;
  }
  res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
}
```

**`const isProduction = ...` outside the function** — evaluated once at module load, not
per request. Environment variables don't change while the process runs.

**`!isProduction || req.secure`** — skip in development (local dev has no TLS and would
break entirely) and skip if already secure.

**`301` not `302`** — `301 Moved Permanently` tells browsers to cache the redirect and go
straight to `https://` next time. `302` is temporary and re-asks every request. For a
permanent HTTPS policy, `301` is correct.

**`req.originalUrl` not `req.url`** — `req.url` gets rewritten by routers as the request
passes through them. `originalUrl` preserves the full path and querystring as it arrived,
so a redirect doesn't silently drop query parameters.

### The `trust proxy` detail that causes infinite loops

```ts
app.set("trust proxy", 1);
```

**This line is what makes `req.secure` work at all.** On Render, TLS terminates at their
proxy. By the time the request reaches your app it is plain HTTP _internally_, with the
original protocol recorded in an `X-Forwarded-Proto` header.

Without `trust proxy`, `req.secure` is **always `false`** in production. So your redirect
sends the user to `https://`, Render terminates TLS, your app again sees "not secure",
redirects again — an **infinite redirect loop** that takes the whole site down.

**Why `1` and not `true`?** The number means "trust exactly one proxy hop". Since clients
can forge `X-Forwarded-*` headers, `true` would trust a whole forged chain and let anyone
spoof their IP — which would let them bypass IP-based rate limiting. `1` matches Render's
actual topology: exactly one proxy. **Match this number to your real infrastructure.**

Verified in both directions:

```
NODE_ENV=production, X-Forwarded-Proto: http   → 301  Location: https://...
NODE_ENV=production, X-Forwarded-Proto: https  → 200  (passes through)
NODE_ENV=development                           → 200  (never redirects)
```

### Cookie configuration

From `src/config/cookie.ts`:

```ts
const cookieDomain = process.env.COOKIE_DOMAIN;

export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  ...(isProduction && cookieDomain ? { domain: cookieDomain } : {}),
};
```

Each flag, and what it defends against:

| Flag                   | Meaning                           | Attack it stops                                                     |
| ---------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `httpOnly: true`       | JavaScript cannot read the cookie | **XSS token theft** — injected scripts can't exfiltrate the session |
| `secure: isProduction` | Only sent over HTTPS              | Network sniffing of the token                                       |
| `sameSite`             | Controls cross-site sending       | **CSRF** — another site making requests as your user                |
| `maxAge`               | Expiry in **milliseconds**        | Limits the window of a stolen token                                 |

**`httpOnly` is the highest-value flag here.** It's what makes an XSS bug survivable
rather than catastrophic — the attacker can act inside the page but can't steal the token
for later reuse.

**`maxAge` is milliseconds**, hence `7 * 24 * 60 * 60 * 1000`. Written as an unevaluated
expression on purpose: `604800000` is unreadable and easy to typo by a factor of ten.
(Careful — `Max-Age` in the raw HTTP header is in _seconds_; Express converts for you.)

**`sameSite: "none"` in production** — required because your client and API are on
different subdomains, which browsers treat as cross-site. Note that `"none"` _mandates_
`secure: true`; browsers reject the combination otherwise. `"lax"` in development is the
sensible default when everything is on localhost.

**`...(isProduction && cookieDomain ? { domain: cookieDomain } : {})`** — conditional
spread. If both conditions hold, spread `{ domain }` into the object; otherwise spread
`{}`, which adds nothing. This is the clean way to include a key _only sometimes_ —
compare it to setting `domain: undefined`, which some libraries treat as an explicit value
rather than an absence.

This replaced a hardcoded `".poruya.com"`. **Why config belongs in environment
variables:** the same code should run in dev, staging, and production without edits. A
hardcoded domain means editing source code to deploy anywhere else.

> ⚠️ **ACTION REQUIRED BEFORE DEPLOYING:** set `COOKIE_DOMAIN=.poruya.com` in your Render
> environment variables. It is documented in `.env.example` but not yet in your live
> config. If it is missing, the cookie domain silently drops and logins may break across
> subdomains. The leading dot means "this domain and all subdomains".

---

## 8. SSRF and path traversal

Two attacks specific to your image upload feature. Both are worth knowing because they
appear whenever a server accepts a URL or a filename from a client.

### SSRF — Server-Side Request Forgery

`POST /img-upload/enhance` took an `imageUrl` from the client and **fetched it**.

The danger: your server sits _inside_ your infrastructure. It can reach things the
attacker cannot. Ask it to fetch a URL and you have a proxy into your own private network:

```json
{ "imageUrl": "http://169.254.169.254/latest/meta-data/iam/credentials" }
```

That address is the **cloud metadata endpoint** — on AWS and most providers it returns
temporary credentials for the machine. `http://localhost:6379` reaches your Redis.
`http://192.168.x.x` reaches internal services. The server obediently fetches whatever
you name.

The fix, in `src/validations/imageUpload.validation.ts`:

```ts
const ALLOWED_IMAGE_HOSTS = [
  "cdn.poruya.com",
  "pub-9d0a95b0f60c4ed5b2b1b34b0d6ecd39.r2.dev",
  "tempfile.aiquickdraw.com",
];

const imageUrl = z
  .string()
  .url()
  .max(2048)
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return (
        parsed.protocol === "https:" &&
        ALLOWED_IMAGE_HOSTS.includes(parsed.hostname)
      );
    } catch {
      return false;
    }
  }, "imageUrl must be an https URL on an allowed host");
```

**`.refine(fn, message)`** — zod's escape hatch for rules its built-ins can't express.
The function returns `true` to accept, `false` to reject.

**`new URL(value)`** — never parse URLs with string methods or regex. A check like
`url.startsWith("https://cdn.poruya.com")` is defeated by
`https://cdn.poruya.com.evil.com` or `https://evil.com#cdn.poruya.com`. The built-in `URL`
parser handles the genuinely surprising edge cases correctly.

**`parsed.hostname` not `parsed.host`** — `host` includes the port (`cdn.poruya.com:8080`),
which would fail an exact-match comparison. `hostname` is just the name.

**`try/catch` returning `false`** — `new URL()` _throws_ on malformed input. Without the
catch, that exception escapes validation and becomes a `500`. An unparseable URL should be
a `400`.

**An allowlist, not a blocklist.** This is the key design decision. Blocking
`169.254.169.254` and `localhost` is a losing game: attackers use `127.1`, `0.0.0.0`,
`[::1]`, decimal-encoded IPs, or DNS names that resolve to internal addresses. Listing
what's _permitted_ means anything you didn't think of is denied by default.

Verified:

```
imageUrl: http://169.254.169.254/latest/meta-data/  → 400 ✓
imageUrl: http://localhost:6379/                    → 400 ✓
imageUrl: https://cdn.poruya.com/test.jpg           → passes validation ✓
```

### Path traversal

The upload endpoint accepted a `folder` name and put it directly into the storage key:

```ts
const key = `${folder}/${filename}`;
```

Send `folder: "../../../etc"` and you write outside the intended location. In an object
store this lets you overwrite _other users'_ files; on a filesystem it can reach system
paths.

```ts
const folder = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "folder may only contain letters, numbers, _ and -",
  );
```

The regex is an allowlist again: only letters, digits, underscore, hyphen. No `/`, no `.`,
so `..` and slashes are structurally impossible. `+` requires at least one character. As
always `^` and `$` anchor the whole string — omit them and `regex` would match a valid
_substring_ inside malicious input.

Verified: `folder: "../../etc"` → `400`; `folder: "uploads"` → accepted.

Note this file **reused a zod schema that already existed** in your codebase
(`type/img-upload-validation.ts`) and had never been wired up. Worth checking for
half-finished work before writing new code.

---

## 9. Startup and shutdown safety

Not injection defence, but this is where quiet production failures come from.

### Fail fast on missing configuration

From `src/config/env.ts`:

```ts
const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().min(1),
  // ...
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}
```

**`process.exit(1)`** — quit immediately with a failure code. `0` means success, anything
else failure; your hosting platform reads this to decide whether the deploy worked.

**Why crashing is the _right_ behaviour.** Without this, a missing `JWT_SECRET` means the
app starts fine and fails later — possibly signing tokens with `undefined`. A server that
boots into a broken state is far worse than one that refuses to boot: the first fails
silently in production, the second fails loudly at deploy time, before users are affected.

**`z.string().min(32)` on `JWT_SECRET`** — a short secret is brute-forceable, and forging
your JWT means impersonating any user. This is a real check, not a formality.

### Don't start serving before dependencies are ready

From `src/index.ts`:

```ts
async function start() {
  try {
    await connectDB();
    await connectRedis();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}
```

**`app.listen` comes after both `await`s.** The original code started listening
immediately, so requests could arrive before Redis connected — and every fail-closed
limiter would reject them. A brief startup delay is better than a burst of confused
`503`s.

### Graceful shutdown

```ts
async function shutdown(signal: string) {
  console.log(`\n${signal} received, shutting down...`);
  if (server) {
    await new Promise<void>((resolve) => server!.close(() => resolve()));
  }
  await disconnectRedis();
  await mongoose.connection.close();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
```

**`SIGTERM`/`SIGINT`** are signals the OS sends to ask a process to stop — `SIGTERM` from
your platform during a deploy, `SIGINT` from `Ctrl+C`.

**`server.close()`** stops accepting _new_ connections but lets in-flight requests finish.
Without it, a deploy kills active requests mid-flight — a user's payment or submission
dies halfway.

**`new Promise<void>((resolve) => ...)`** — `server.close()` uses a callback; wrapping it
in a Promise lets us `await` it, so the Redis and Mongo cleanup below genuinely runs
_after_ the server stopped. This is the standard callback-to-Promise conversion pattern.

**`server!.close()`** — the `!` is a non-null assertion, telling TypeScript "I know this
isn't null here." Safe because it's inside `if (server)`; TypeScript can't always follow
that narrowing across a closure boundary.

**`void shutdown(...)`** — `void` explicitly discards the returned Promise, signalling
"I know this is async and I'm deliberately not awaiting it." Without it, linters flag an
unhandled floating Promise. It documents intent rather than looking like an oversight.

**`process.exit(0)`** — `0` because this shutdown was intentional and successful.

---

## 10. Full list of changes

### Rate limiting

| #   | Change                                          | Why it mattered                                              |
| --- | ----------------------------------------------- | ------------------------------------------------------------ |
| 1   | **Mounted `generalLimiter`** in `app.ts`        | It was never mounted. Every route but five was unlimited.    |
| 2   | Auth limiters keyed by **phone**, not IP        | CGNAT — five users could have locked out a whole carrier     |
| 3   | Added `authIpLimiter` (30/IP) as a backstop     | Stops one machine spraying attempts across many phones       |
| 4   | `passOnStoreError: true` on general + enhance   | Redis blip no longer `500`s the whole site                   |
| 5   | `passOnStoreError: false` on all auth limiters  | A Redis outage must not open the door to brute-forcing       |
| 6   | Removed `skipSuccessfulRequests` from `sendOtp` | Each success writes a DB row; successes must be counted      |
| 7   | `failClosed` wrapper → `503`                    | Raw `"The client is closed"` no longer reaches users         |
| 8   | Per-command Redis timeout (1000ms)              | Requests hung 30–60s during a DNS blip; now ~70ms            |
| 9   | `disableOfflineQueue: true`                     | Reject while disconnected instead of buffering               |
| 10  | `ipKeyGenerator()` for IPv6                     | A `/64` block gave ~18 quintillion free keys                 |
| 11  | `standardHeaders: "draft-7"`                    | Clients can read the limit; also how you verify it's mounted |
| 12  | `enhanceLimiter` keyed by user id               | Paid AI endpoint — per-account, mounted after `requireAuth`  |

### Injection and validation

| #   | Change                                            | Why                                                        |
| --- | ------------------------------------------------- | ---------------------------------------------------------- |
| 13  | **`sanitizeRequest`** middleware                  | Stripped `$` operators → closed the NoSQL login bypass     |
| 14  | Avoided `express-mongo-sanitize`'s `middleware()` | It breaks 100% of requests on Express 5                    |
| 15  | **`validate(schema)`** middleware                 | One reusable validator, consistent `400` with field errors |
| 16  | Schemas for ~20 high-risk routes                  | Auth, questions, exams, uploads, CRUD updates              |
| 17  | `.strict()` whitelists on 6 update routes         | Blocked mass assignment into `findByIdAndUpdate`           |
| 18  | Bounded `safeSearch` (max 100)                    | ReDoS — an unbounded `$regex` can pin your CPU             |
| 19  | `objectId` regex validation                       | Mongo cast `500`s became clean `400`s                      |
| 20  | `password` required in `sendOtp`                  | `bcryptjs.hash(undefined)` threw a confusing error         |
| 21  | Capped bulk-create array length                   | Unbounded `insertMany` was a memory-exhaustion vector      |

### Credentials and transport

| #   | Change                                       | Why                                                 |
| --- | -------------------------------------------- | --------------------------------------------------- |
| 22  | **`select: false`** on `password` + tokens   | Hash was returned to clients on 3 public routes     |
| 23  | `.select("+password")` in `loginWithPhone`   | The one place the hash is legitimately needed       |
| 24  | Removed `console.log(user)` from `verifyOtp` | Hashes were being written to server logs            |
| 25  | Destructured hash out of the login response  | Defence in depth alongside `select: false`          |
| 26  | **`httpsRedirect`** middleware               | `301` http→https in production only                 |
| 27  | `COOKIE_DOMAIN` env var                      | Replaced hardcoded `".poruya.com"`                  |
| 28  | **SSRF allowlist** on `imageUrl`             | Blocked cloud metadata and internal-network fetches |
| 29  | **Path-traversal regex** on `folder`         | Blocked `../../` in storage keys                    |

### Reliability

| #   | Change                                | Why                                                       |
| --- | ------------------------------------- | --------------------------------------------------------- |
| 30  | `app.listen` after DB + Redis connect | Requests arrived before Redis was ready → spurious `503`s |
| 31  | Graceful `SIGTERM`/`SIGINT` shutdown  | Deploys no longer kill in-flight requests                 |
| 32  | Env validation with `process.exit(1)` | Fail at boot, not at 3am with `undefined` config          |
| 33  | Health route above the limiter        | Render's health checks don't consume the budget           |

---

## 11. How to verify security work

The habits below generalise to any project. They matter more than any individual fix in
this document.

### Prove the "before" first

For every fix, run the attack **before** you change anything. If it doesn't succeed, your
model of the bug is wrong and you may be about to write a pointless change. I did this for
the password leak and captured the real hash in a response — that's what turned "this
looks risky" into "this is confirmed broken".

### Check it's actually running

The most expensive bug here was code that was perfect and never called. Look for external
evidence:

```bash
curl -i localhost:5000/subject | grep -i ratelimit    # header proves it's mounted
```

Grepping for callers is the cheap version of this check:

```bash
grep -rn "generalLimiter" src/     # a definition with no usage is a red flag
```

### Test the negative case

Easy to confirm a limit blocks at 9 requests. The test people skip is that a _different_
user is **not** blocked. Otherwise you may have built a global limiter by accident and
won't discover it until users complain.

### Test the regression the fix could cause

`select: false` fixed the leak. It also could have broken **every login on the site** if
`.select("+password")` were missing. Always ask: _what did this fix put at risk?_

### Verify library behaviour against your versions

Two failures in this project came from trusting documentation:

- `express-mongo-sanitize`'s documented usage breaks all requests on Express 5.
- `commandOptions: { timeout }` on the Redis client type-checked, compiled, and did
  nothing.

Both were caught in a scratch folder in about two minutes. **A clean compile is not
evidence that behaviour is correct.**

### Read library defaults

`passOnStoreError` defaults to `false`. Nobody chose that for this app — it was inherited.
Every default in a security-relevant library is a decision someone else made without
knowing your requirements.

### The reusable recipe

```
1. Reproduce the attack           → confirm it works now
2. Read the actual library defaults
3. Test the library against YOUR versions, in a scratch folder
4. Make the fix
5. Re-run the attack              → confirm it fails
6. Run the happy path             → confirm you didn't break the feature
7. Test the negative case         → confirm the scope is right
8. npx tsc --noEmit               → confirm types are clean
```

Step 6 is the one that separates a fix from an outage.

---

## 12. Lessons and open items

### The five ideas worth carrying forward

**1. Order encodes assumptions.** Sanitize after parsing, limit before validating. Each
layer depends on what ran before it. When adding middleware, ask what it needs to already
be true.

**2. Secure by default beats remembering.** `select: false` means forgetting about
passwords is safe. Patching three endpoints would mean the fourth one you write next month
leaks again. Make the safe path automatic.

**3. Fail-open vs fail-closed is a per-route decision.** There is no universally correct
answer. Availability for browsing; protection for auth. Decide deliberately and write down
why — the comments in `rate-limit.ts` exist for exactly this reason.

**4. Allowlists, not blocklists.** For hosts, folders, and update fields. You cannot
enumerate every bad input; you can enumerate the good ones. Anything you didn't think of
is then denied by default rather than allowed.

**5. Verify behaviour, not code.** The unmounted limiter, the no-op timeout, and the
comment that promised "never send password" all _looked_ right. Only running them revealed
the truth.

### Before you deploy

⚠️ **Set `COOKIE_DOMAIN=.poruya.com` in Render's environment variables.** Documented in
`.env.example`, not yet in your live config.

### Deliberately left alone

**Hardcoded OTP** (`auth-controller.ts`) — `const otp = "123456"`, with the random version
commented out above it. This is a real vulnerability: anyone can verify any phone number.
It stays because **no SMS provider is wired up**; randomising it would break signup
entirely. Fix it when you integrate SMS, not before.

**`requireAuth` returns `200` for unauthenticated requests** — unusual (should be `401`),
but your client depends on the current shape. Worth revisiting alongside a frontend change.
Note it would also silently break `skipSuccessfulRequests` on any future limiter mounted
behind it.

**Dead config** — `FRONTEND_URL`, `BACKEND_URL`, `DEV_FRONTEND_URL`, `DEV_BACKEND_URL` are
in `.env` but read by zero lines of `src`. Harmless, but they mislead the next reader.

**~25 simple `GET /:id` routes** still lack validation. Lower risk (a bad id yields a Mongo
cast error, not a breach). The `objectIdParam` schema in `validations/common.ts` is ready
for a follow-up pass.

### Not yet addressed

- **CSRF tokens** — `sameSite` cookies cover the common cases; a token adds depth.
- **Refresh-token rotation** — a 7-day JWT can't be revoked before expiry.
- **Account lockout** — rate limiting slows guessing but never locks an account.
- **Audit logging** — no record of who changed what.
- **Automated tests** — everything here was verified manually. These checks belong in a
  test suite so a future change can't silently undo them.

### What was already right

Worth stating plainly, because good existing decisions are easy to overlook:

- **bcrypt with 10 salt rounds** — correct algorithm, correct cost, correct argument order.
- **JWT payload contains no secrets**, and `role` is re-read from the database on every
  request rather than trusted from the token.
- **`httpOnly` + `secure` + `sameSite`** cookies were already configured correctly.
- **Helmet and an explicit CORS allowlist** were already in place.
- **Zero hardcoded `http://`** anywhere in `server/src` or `client/src` — that migration
  was already done properly.
