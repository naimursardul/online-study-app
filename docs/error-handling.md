# Error Handling in This Project — A Complete Guide for Beginners

This document explains every error-handling idea used in this project. It is written in easy
English. Read it from top to bottom once. After that, use the checklists at the end when you
write new code.

---

## Table of contents

**Part 1 — The ideas (what and why)**

1. [The big picture](#1-the-big-picture)
2. [Words you need to know](#2-words-you-need-to-know)
3. [HTTP status codes — the vocabulary of the web](#3-http-status-codes--the-vocabulary-of-the-web)
4. [Server side: Express](#4-server-side-express)
5. [Client side: React](#5-client-side-react)
6. [Checklists: how to do it yourself](#6-checklists-how-to-do-it-yourself)

**Part 2 — The full code mechanism (how it really works)**

7. [How Express catches a thrown error](#7-how-express-catches-a-thrown-error)
8. [Line by line: errorHandler.ts](#8-line-by-line-errorhandlerts)
9. [Line by line: validate.ts](#9-line-by-line-validatets)
10. [How axios builds the error object](#10-how-axios-builds-the-error-object)
11. [Line by line: api-error.ts](#11-line-by-line-api-errorts)
12. [Line by line: the axios client and interceptor](#12-line-by-line-the-axios-client-and-interceptor)
13. [Line by line: ErrorBoundary.tsx](#13-line-by-line-errorboundarytsx)
14. [Line by line: the AbortController pattern](#14-line-by-line-the-abortcontroller-pattern)
15. [One full journey: a wrong password, start to finish](#15-one-full-journey-a-wrong-password-start-to-finish)

---

# PART 1 — THE IDEAS (WHAT AND WHY)

## 1. The big picture

A MERN app has three main parts. A request travels through all of them:

```
User clicks a button
      |
      v
[ Client ]  React app in the browser (Vercel)
      |   HTTP request (axios)
      v
[ Server ]  Express app (Render)
      |   database query (Mongoose)
      v
[ Database ]  MongoDB
```

An error can happen at **every arrow**:

- The network can be down. The request never reaches the server.
- The server can reject the request: wrong password, missing field, no permission.
- The database can fail: bad id, duplicate data, server crash.
- The React code itself can crash while rendering.

Each place needs its own plan. This project has that plan:

| Where | What handles errors |
|---|---|
| Server (Express) | A central error handler + `throw` helpers |
| Client (axios) | A response interceptor + shared helper functions |
| Client (React UI) | Error states, retry buttons, loading states, an ErrorBoundary |

---

## 2. Words you need to know

| Word | Easy meaning |
|---|---|
| **Client** | The app running in the user's browser. Here: React. |
| **Server** | The program that answers requests. Here: Express on Node.js. |
| **API** | The set of URLs the server offers, like `POST /auth/login-with-phone`. |
| **HTTP request** | A message the browser sends to the server. |
| **HTTP response** | The server's answer. It always has a **status code** and a body. |
| **Status code** | A number that says "what kind of answer is this". `200` = OK, `404` = not found. |
| **JSON** | Text format for data: `{ "name": "Naimur" }`. Requests and responses use it. |
| **Middleware** | A function that runs between the request arriving and your controller running. |
| **Controller** | The function that handles one API route, e.g. `getAllQuestions`. |
| **try / catch** | JavaScript's way to say: "try this; if it fails, run the catch part." |
| **throw** | Create an error on purpose: `throw new Error("not found")`. It stops the current function. |
| **async / await** | Modern way to write code that waits for slow things (network, database). |
| **Promise** | A "ticket" for a value that arrives later. `await` waits for the ticket. |
| **Validation** | Checking that input is correct *before* using it. Is the phone 11 digits? |
| **Envelope** | One fixed JSON shape for all responses: `{ success, message, data }`. |
| **Toast** | The small pop-up message in the corner of the screen (sonner library). |
| **Session / JWT** | Proof that a user is logged in. A token stored in a cookie. |

---

## 3. HTTP status codes — the vocabulary of the web

Every response has a status code. Programs read this number *before* reading anything else.

### Codes used in this project

| Code | Name | Easy meaning |
|---|---|---|
| 200 | OK | "It worked. Here is the data." |
| 201 | Created | "It worked, and I made something new." (after create) |
| 400 | Bad Request | "Your input is wrong." (missing field, bad format) |
| 401 | Unauthorized | "I do not know who you are. Please log in." |
| 403 | Forbidden | "I know who you are, but you may not do this." (not admin) |
| 404 | Not Found | "The thing you asked for does not exist." |
| 409 | Conflict | "This already exists / this conflicts with current data." |
| 413 | Payload Too Large | "The file you sent is too big." |
| 429 | Too Many Requests | "Slow down. You are sending too many requests." |
| 500 | Internal Server Error | "Something broke on my side. Not your fault." |
| 503 | Service Unavailable | "I am not ready right now. Try again soon." |

### The mistake this project had before

The server used to answer like this when something failed:

```ts
// OLD — bad
res.status(200).json({ success: false, message: "Exam not found." });
```

The body said "failed", but the **status code said 200 = success**. Why is that bad?

- **Browsers and axios** see 200 and think everything is fine. In axios, a 2xx response does
  **not** throw. So the error handling code in `catch` never runs.
- **Monitoring tools** count 200 responses as "the API is healthy". A broken API looked healthy.
- **Google and other bots** think the page is fine.
- **Retry logic** in any tool only retries on 4xx/5xx. A fake 200 is never retried.

**The rule:** the status code and the body must tell the same story.
Failed = 4xx or 5xx. Success = 2xx. The project had 33 places where they disagreed. All fixed.

### The envelope — one shape for every response

Every response in this project follows one fixed shape:

```jsonc
// success
{ "success": true,  "message": "…", "data": { … } }

// failure
{ "success": false, "message": "Human-readable reason",
  "errors": [ { "path": "phone", "message": "Phone must start with 01" } ] }
```

Why one fixed shape? Because the client can write **one** function that understands every
response. If every endpoint had a different shape, you would need different code everywhere.

`errors` is optional. It only appears when the server knows *which field* is wrong. Forms use
it to put the message directly under the wrong input.

---

## 4. Server side: Express

### 4.1 The old way vs the new way

**Old way (bad):** every controller answered errors by hand:

```ts
// OLD — repeated in 33 places, each slightly different
try {
  const exam = await Exam.findById(id);
  if (!exam) {
    res.status(200).json({ success: false, message: "Exam not found." });
    return;
  }
} catch (error) {
  res.status(200).json({ success: false, message: error.message }); // leaks internals!
}
```

Problems:

- Wrong status codes (200 for failures).
- `error.message` can contain secret internal text like database paths or `"jwt expired"`.
- The same code repeated 33 times.

**New way:** the controller only *throws*. One central place handles everything.

### 4.2 `AppError` — an error that knows its status code

File: `server/src/middlewares/errorHandler.ts`

```ts
export class AppError extends Error {
  constructor(
    readonly status: number,   // the HTTP code to use, e.g. 404
    message: string,           // safe to show to the user
    readonly expose = true,    // false = hide the message, use a generic 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Short helpers so controllers read like sentences:
export const badRequest   = (m: string) => new AppError(400, m);
export const unauthorized = (m = "Authentication required.") => new AppError(401, m);
export const forbidden    = (m = "You do not have permission…") => new AppError(403, m);
export const notFound     = (m: string) => new AppError(404, m);
export const conflict     = (m: string) => new AppError(409, m);
```

Now a controller reads like this:

```ts
const exam = await Exam.findById(examId);
if (!exam) throw notFound("Exam not found.");
if (exam.userId !== userId) throw forbidden();
```

That's all. No `res.status(...)` needed. Express 5 automatically forwards a thrown error from
an `async` function to the error handler. You do **not** need a wrapper function.

### 4.3 The central error handler — one place for every error

File: `server/src/middlewares/errorHandler.ts` (mounted last in `app.ts`)

The handler has two jobs:

1. **Log the real error** on the server (`console.error(err)`). The developer sees everything.
2. **Send a mapped, safe answer** to the client.

The mapping table (`mapError`):

| The thrown error is… | Answer with | Client message |
|---|---|---|
| Our own `AppError` | its own status | its own message (we wrote it, it is safe) |
| Mongoose `ValidationError` | 400 | "Validation failed" + field list |
| Mongoose `CastError` (bad id) | 400 | "Invalid id." |
| Mongo code `11000` (duplicate) | 409 | "That already exists." |
| JWT expired / broken | 401 | "Session expired. Please log in again." |
| Multer file too large | 413 | "File is too large." |
| Broken JSON body | 400 | "Invalid JSON body." |
| Anything else | 500 | "Internal Server Error" |

The last row is the security part. Real error messages from libraries can contain internal
details: database collection names, index names, file paths. Attackers love this information.
So for unknown errors, the client only ever sees `"Internal Server Error"`. The full details
go to the server log, where only you can read them.

```ts
export const errorHandler = (err: unknown, _req, res, next) => {
  if (res.headersSent) return next(err); // answer already started, do not send twice

  console.error(err);                    // full detail for the developer
  const mapped = mapError(err);          // safe version for the user
  res.status(mapped.status).json({
    success: false,
    message: mapped.message,
    ...(mapped.errors ? { errors: mapped.errors } : {}),
  });
};
```

### 4.4 The 404 catch-all

After all real routes, one extra route catches every unknown URL:

```ts
// Without this, an unknown URL returns Express's default HTML page "Cannot GET /xyz".
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found." });
});
```

Order matters: it must be **after** every real route and **before** the error handler.

### 4.5 Validation — reject bad input at the door

File: `server/src/middlewares/validate.ts`

Validation checks user input **before** the controller runs. This project uses **zod**: you
write a schema (a description of correct data), and zod checks every request against it.

```ts
// A schema: phone must match the pattern, password at least 6 characters.
const loginSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^01\d{9}$/),
    password: z.string().min(6),
  }),
});

// Mount it on the route:
router.post("/login-with-phone", validate(loginSchema), loginWithPhone);
```

When input is wrong, `validate` answers **400** with a field list:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "path": "phone", "message": "Phone must start with 01 and be 11 digits." }
  ]
}
```

Why the `path` matters: the form can take this exact message and show it **under the phone
input**. The user sees *what* is wrong and *where*. (See section 5.6.)

One security rule here: the validate middleware **never logs** the request body. Login and
password-reset routes go through it. Logging the body would write plaintext passwords to the
server log files.

### 4.6 Errors that are not errors

Some "failures" are normal situations and should **not** be errors:

- A brand-new user opens the dashboard and has no exams yet → answer **200** with empty data.
  The client shows an empty state. It is not a 500.
- "No questions found for this filter" → 404 is correct for a *specific* paper, but an empty
  *list* is a valid, successful answer.

Ask yourself: "Is this a broken request, or a valid request with an empty result?"
Empty result → 200 + empty array. Broken request → 4xx.

### 4.7 Two short notes

- **Rate limiting**: limiters stop abuse (100 guesses per 15 minutes). "Fail-open" = if Redis
  is down, allow requests (keep the site usable). "Fail-closed" = if Redis is down, refuse
  (keep auth safe). This project uses fail-closed only for auth and paid endpoints.
- **Don't log secrets**: never `console.log` a request body, password, OTP, or token. Logs
  are often copied to many places and live for years.

---

## 5. Client side: React

### 5.1 The one fact that explains everything: axios throws on 4xx/5xx

When the server answers 200, axios gives you the response normally:

```ts
const res = await client.post("/auth/login-with-phone", values);
const data = res.data; // works
```

When the server answers 400, 401, 404, 500… axios **throws an error**. Your code jumps
straight to `catch`. `res` never exists. So all user-facing error text must be built **in the
catch block**.

```ts
try {
  const res = await client.post("/exam/create-answer", payload);
  // only runs on 2xx
} catch (error) {
  // runs on 4xx and 5xx — show the message here
}
```

### 5.2 The "keep both paths" rule

The client (Vercel) and the server (Render) deploy **separately**. There is always a short
time when one is new and the other is old. So every call site checks **both**:

```ts
try {
  const res = await client.get("/exam");
  const { data } = res;

  // Path 1: old server style — 200 with success:false in the body
  if (!data.success) {
    toast.error(data.message || "Failed to load exams.");
    return;
  }
  setExams(data.data);
} catch (error) {
  // Path 2: new server style — real 4xx/5xx, axios throws
  toast.error(getApiErrorMessage(error, "Failed to load exams."));
}
```

Never delete the `if (!data.success)` check. It looks like dead code today, but it protects
you during the deploy window.

### 5.3 One shared error-message helper

File: `client/src/lib/api-error.ts`

Before this helper existed, the project had five different ways to read an error message.
Now there is one:

```ts
getApiErrorMessage(error, "Fallback text.")
```

It tries, in order:

1. The server's own message (`error.response.data.message`) — e.g. "Exam not found."
2. A default text for the status code —
   401 → "Please log in again.",
   403 → "You do not have permission…",
   404 → "Not found.",
   429 → "Too many requests. Please try again shortly.",
   500+ → "Something went wrong on our end."
3. Your fallback text.

It also tells apart two very different situations:

- **No response at all** (`error.response` is empty) → network is down, server is sleeping,
  request timed out → message: **"Could not reach the server."**
- **A response arrived with an error code** → the server is alive and answered → use the
  server's message.

This matters because your app runs on Render's free tier. The server "sleeps" when nobody
uses it. The first request after sleep can take 20+ seconds. That is not a bug in your code —
and the user should see "Could not reach the server", not "Request failed with status code
undefined".

### 5.4 The axios interceptor — one place that sees every request

File: `client/src/utils/utils.ts`

An **interceptor** is a function that runs on **every** response. You write it once, and it
works for all 44 API calls in the app. No component needs to repeat it.

```ts
const client = axios.create({
  baseURL: import.meta.env.VITE_PRODUCTION_API,
  withCredentials: true,  // send the login cookie with every request
  timeout: 30000,         // give up after 30 seconds (cold starts are slow)
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // 401 = "I do not know who you are" = the session died.
      // Log the user out ONCE here, for the whole app.
      const url = error.config?.url ?? "";
      if (unauthorizedHandler && !AUTH_401_ALLOWLIST.includes(url)) {
        unauthorizedHandler();
      }
    }
    return Promise.reject(error); // still let the page handle it too
  },
);
```

Two details worth understanding:

- **Why `AUTH_401_ALLOWLIST`?** The login and OTP endpoints *correctly* answer 401 when a
  password is wrong. If the interceptor logged the user out on those, you would be thrown
  out of the login page while typing a wrong password. The list skips those URLs.
- **Why the toast problem existed:** a page with 20 questions fires 20 requests. If the
  session dies, all 20 fail with 401 and used to show **20 identical toasts**. The
  interceptor handles 401 in one place, and toasts use fixed IDs (`{ id: "saved-status" }`)
  so duplicates replace each other instead of stacking.

### 5.5 Failed load ≠ empty data

The worst kind of bug: a failed request that *looks* like success.

```
Request fails  →  catch does nothing  →  state stays []  →  UI shows "No exams yet."
```

The user has exams. The message "No exams yet. Create your first exam." is a **lie**. And the
user cannot tell "I have no data" apart from "the server is down".

The fix has two shared components:

```tsx
// client/src/components/shared/ApiErrorState.tsx
<ApiErrorState error={error} onRetry={refetch} />
// Red box: "Could not load this" + the message + a "Try again" button.

// client/src/components/shared/EmptyState.tsx
<EmptyState title="No exams yet" description="Create your first exam." />
// Grey dashed box: genuinely zero items.
```

The pattern for every page that loads data:

```tsx
const [items, setItems] = useState<Item[]>([]);
const [loadError, setLoadError] = useState<unknown>(null);
const [reloadToken, setReloadToken] = useState(0); // "try again" bumps this

useEffect(() => {
  // fetch…
  // success → setItems(res.data.data)
  // failure → setLoadError(error)
}, [reloadToken]);

if (loadError !== null) {
  return <ApiErrorState error={loadError} onRetry={() => setReloadToken((t) => t + 1)} />;
}
return <ItemList items={items} />;
```

The `reloadToken` trick: the "Try again" button adds 1 to the token. The effect depends on
the token, so it re-runs the fetch. Simple and reliable.

**Honest numbers, too.** The analytics page used to show `stats?.overallAccuracy ?? 0` when
loading failed — a confident "0% accuracy" that was actually "we could not load your data".
Never show `0` for unknown. Show the error state.

### 5.6 Form errors — under the input, not in a toast

A toast saying "Validation failed" does not help the user. Which field is wrong? The server
already tells us: `errors: [{ path, "phone", message: "…" }]`.

File: `client/src/lib/api-error.ts`

```ts
applyApiFieldErrors(error, ["phone", "password"], form.setError)
```

This function:

1. Reads the `errors` array from the server's answer.
2. For each issue whose `path` matches a form field → calls
   `form.setError("phone", { message: "…" })`. react-hook-form shows the message directly
   under that input. 
3. For any path the form does not have → shows a toast instead (never silently dropped).
4. Returns `true` if at least one field got a message.

Usage in a form:

```tsx
} catch (error) {
  // Field errors land under their inputs; anything else becomes one toast.
  if (!applyApiFieldErrors(error, ["phone", "password"], form.setError)) {
    toast.error(getApiErrorMessage(error, "Something went wrong. Please try again."));
  }
}
```

### 5.7 Loading states — stop double submits

Problem: the user clicks "Submit". The request takes 2 seconds. Nothing on screen changes.
The user clicks again. Now the server created **two** accounts / two exams.

Fix: a boolean state. Set it `true` before the request, `false` in `finally`. Disable the
button while it is `true`:

```tsx
const [loading, setLoading] = useState(false);

async function handleSubmit() {
  setLoading(true);
  try {
    // await client.post(...)
  } finally {
    setLoading(false); // finally runs on success AND failure
  }
}

<Button disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
```

In react-hook-form forms you get this for free:

```tsx
<SubmitBtn loading={form.formState.isSubmitting} />
```

### 5.8 AbortController — stop old requests from overwriting new ones

Problem: the question page refetches when the user clicks a different paper in the sidebar.

```
Click paper A  → request A starts (slow)
Click paper B  → request B starts (fast), returns → page shows paper B ✓
Request A finally returns → page shows paper A again ✗ (wrong!)
```

The old slow answer arrives last and **overwrites** the new one. This is called a **race
condition**. The fix: cancel the old request when a new one starts.

```tsx
useEffect(() => {
  const controller = new AbortController(); // 1. make a "cancel button"

  async function fetchQuestions() {
    try {
      const res = await client.get(`/question?${params}`, {
        signal: controller.signal, // 2. connect the button to this request
      });
      // …setQuestions(…)
    } catch (error) {
      if (axios.isCancel(error)) return; // 4. a cancelled request is NOT a failure
      setLoadError(error);
    } finally {
      // 5. don't touch state if this request was cancelled
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }
  fetchQuestions();

  return () => controller.abort(); // 3. cancel when the effect re-runs (or unmounts)
}, [qDetails]);
```

Three rules to remember:

1. Pass `signal` to the request.
2. In `catch`, check `axios.isCancel(error)` first and just `return`.
3. In `finally`, only update state if `!controller.signal.aborted`.

### 5.9 The ErrorBoundary — when React itself crashes

If a component throws while rendering (a typo like `data.summary.total` when `data` is
undefined), React unmounts the **whole page**. The user sees a blank white screen.

A class component called **ErrorBoundary** catches render crashes and shows a fallback
instead:

```tsx
// client/src/components/shared/ErrorBoundary.tsx — mounted in main.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true }; // triggers the fallback UI
  }

  componentDidCatch(error: unknown) {
    console.error(error); // still log it — you need the details
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. <button onClick={() => location.reload()}>Reload</button></div>;
    }
    return this.props.children;
  }
}
```

React hooks cannot do this job; it must be a class component. That is the one class
component in this project.

### 5.10 Saving user work — the exam answer example

The exam page posts answers with `POST /exam/create-answer`. If that request fails, the
user's 30 minutes of work must not disappear. Three protections:

1. **Save answers to `sessionStorage` while the exam runs.** The browser keeps them even if
   the page reloads. Key: `exam-answers-${examId}`.
2. **Show a retry button** on failure (`ApiErrorState` with `onRetry={handleSubmit}`).
3. **Remove the saved copy only after a successful submit** — never before.

Rule: for any long user input (exam, editor, long form), save it locally as the user types.
Submit is the *only* moment data may be deleted.

---

## 6. Checklists: how to do it yourself

### 6.1 Add a new API endpoint (server)

1. Write a zod schema for the input (body, query, params).
2. Mount `validate(schema)` on the route, before the controller.
3. In the controller, `throw notFound(...)`, `throw badRequest(...)`, etc. — never build the
   error response by hand.
4. Success with data → `res.status(200).json({ success: true, data })`.
5. Success that creates something → **201**.
6. Empty result that is normal → 200 with `data: []`. Not an error.
7. Let the central error handler do the rest. Add a new row to its table only for a genuinely
   new error type.
8. Never log the request body.

### 6.2 Call an API from React

1. Add state: the data, `loadError`, and (if the page needs it) `reloadToken`.
2. Fetch inside `useEffect`. On failure, `setLoadError(error)` — never leave the catch empty.
3. Keep both paths: `if (!data.success)` **and** the catch block.
4. In the catch, use `getApiErrorMessage(error, "your fallback")`. One wording, everywhere.
5. For pages: failed → `<ApiErrorState error onRetry>`, empty → `<EmptyState>`. Never render
   one for the other.
6. For a form: use `applyApiFieldErrors` first, toast only as fallback.
7. Disable submit buttons during requests (`loading` state or `formState.isSubmitting`).
8. If the fetch re-runs when filters change → add the AbortController pattern (three rules
   from section 5.8).
9. For anything the user types for a long time → save to `sessionStorage` as they go.

### 6.3 Quick review questions (ask yourself before opening a PR)

- Does a failed request ever look like "no data"? (It must not.)
- Does any error path show internal text (`error.message` straight from a library)?
- Can the user double-submit anything?
- Does a cancelled request set an error state? (It must not.)
- Does any `console.log` print a password, OTP, token, or full request body?
- Is there one wording for "server problem" across the app? (There should be.)

---

*Sources in this repo: `server/src/middlewares/errorHandler.ts`,
`server/src/middlewares/validate.ts`, `client/src/lib/api-error.ts`,
`client/src/utils/utils.ts`, `client/src/components/shared/ApiErrorState.tsx`,
`client/src/components/shared/EmptyState.tsx`, `client/src/components/shared/ErrorBoundary.tsx`.
See `server/SECURITY.md` for the security-side story.*

---

# PART 2 — THE FULL CODE MECHANISM

Part 1 told you *what* each piece does. Part 2 opens every file and shows *how*, line by
line. New words you meet here are explained the first time they appear.

## 7. How Express catches a thrown error

Before reading the error handler, you must understand the machine it plugs into. Express is
a **chain of middleware**. Every request walks through the chain from top to bottom:

```
request
  → express.json()          (reads the body)
  → validate(schema)        (your zod check)
  → controller              (your route function)
  → …
  → errorHandler            (last stop — only for errors)
  → 404 catch-all           (only if nothing answered)
```

Each middleware receives `(req, res, next)`. It can:

- answer the request itself (`res.status(200).json(...)`), or
- call `next()` → the request moves to the next middleware in the chain, or
- call `next(err)` → **error mode**.

### Error mode — the trick nobody tells beginners

`next()` and `next(err)` are the same function. Express tells them apart by the
**argument**:

- `next()` (no argument) → "continue normally".
- `next(err)` (anything truthy) → "skip everything normal. Jump to the error middleware."

And how does Express know which middleware is an *error* middleware? By counting the
function's parameters. **Four parameters `(err, req, res, next)` = error middleware.**
Three parameters = normal middleware. That is the whole mechanism. Express literally counts
the arguments of your function.

```
app.get("/x",  handler)        // 3 params → normal middleware
app.use(errorHandler)          // 4 params → error middleware (only reached via next(err))
```

### How a `throw` inside a controller becomes `next(err)`

In old Express (version 4), an `async` controller that threw an error would **crash the
process**, because Express did not look at the rejected promise. You needed a wrapper
function like `asyncHandler(fn)`.

This project uses **Express 5**. Express 5 awaits your controller. If the controller's
promise rejects (any `throw` inside an async function rejects its promise), Express itself
calls `next(err)` for you. No wrapper needed. So this single line:

```ts
throw notFound("Exam not found.");
```

does all of this, automatically:

```
throw inside async controller
  → the controller's Promise rejects
  → Express 5 notices the rejection
  → Express calls next(err) for you
  → error mode: all normal middleware is skipped
  → errorHandler (4 params) runs
  → the client receives { success: false, message: "Exam not found." } with status 404
```

> **The trick to remember:** `throw` in a controller = "Express, please jump to the error
> handler with this error." You never build an error response by hand.

### Trace 1 — the full journey of one thrown error

The user opens `GET /exam/6f8a…` with an id that does not exist.

| Step | File | What happens |
|---|---|---|
| 1 | `question-routes.ts` / `exam-routes.ts` | The route matches. Express puts the controller on the chain. |
| 2 | the controller | `const exam = await Exam.findById(examId);` returns `null`. |
| 3 | the controller | `if (!exam) throw notFound("Exam not found.");` — the promise rejects. |
| 4 | Express 5 internals | The rejection is caught. Express calls `next(err)`. |
| 5 | Express 5 internals | Error mode: every normal middleware after this point is skipped. |
| 6 | `middlewares/errorHandler.ts` | `errorHandler` runs (it has 4 parameters). |
| 7 | `errorHandler.ts` | `console.error(err)` — the full error goes to the server log. |
| 8 | `errorHandler.ts` | `mapError(err)` — it is an `AppError` → keep status 404 and our message. |
| 9 | `errorHandler.ts` | `res.status(404).json({ success: false, message: "Exam not found." })`. |
| 10 | the browser | axios receives 404 → **throws** → the page's `catch` runs (Part 1, section 5). |

---

## 8. Line by line: errorHandler.ts

File: `server/src/middlewares/errorHandler.ts` — the heart of server-side error handling.
Everything thrown anywhere on the server ends up here.

### Chunk 1 — imports

```ts
import { NextFunction, Request, Response } from "express";
import { Error as MongooseError } from "mongoose";
import { MulterError } from "multer";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
```

**Line by line:**

- `NextFunction, Request, Response` — the Express types. We need them for the handler's
  signature (4 parameters — see section 7).
- `Error as MongooseError` — Mongoose exports its own error classes. We import its base
  `Error` class **renamed** to `MongooseError`, so it does not clash with JavaScript's
  built-in `Error`.
- `MulterError` — errors from Multer, the file-upload library.
- `JsonWebTokenError, TokenExpiredError` — the two error classes the `jsonwebtoken`
  library throws: a broken token, and an expired token.

Why imports matter here: `instanceof` (coming below) only works if you check against the
*same class* the library threw. You cannot write `instanceof MulterError` without importing
the real `MulterError`.

### Chunk 2 — the AppError class

```ts
export class AppError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly expose = true,
  ) {
    super(message);
    this.name = "AppError";
  }
}
```

**Line by line:**

- `class AppError extends Error` — our error is a real JavaScript `Error` with extra
  powers. Because it extends `Error`, `throw new AppError(...)` produces a normal error
  with a stack trace (the list of lines showing where it was thrown — very useful in logs).
- `constructor(readonly status: number, message: string, readonly expose = true)` — three
  settings when you create one. `readonly` means "store this on the error; nobody may
  change it later". `= true` makes the third setting optional with a default.
- `status` — the HTTP code this error should answer with (404, 403…).
- `message` — the text to show the user. Not `readonly` here only because the `Error`
  parent class already stores the message.
- `expose` — the safety switch. `true` (default) = "I wrote this message myself. It is
  safe to show to users." `false` = "treat me like an unknown error: log me, answer with a
  generic 500."
- `super(message)` — calls the parent `Error` constructor. This is what actually stores
  the message and creates the stack trace. **Forgetting `super(...)` is a classic bug** —
  the error would exist but be empty.
- `this.name = "AppError"` — errors have a `name` property (normally `"Error"`). Setting it
  makes logs readable: `AppError: Exam not found.` instead of `Error: Exam not found.`

### Chunk 3 — the helper functions

```ts
export const badRequest = (message: string) => new AppError(400, message);
export const unauthorized = (message = "Authentication required.") =>
  new AppError(401, message);
export const forbidden = (
  message = "You do not have permission to perform this action.",
) => new AppError(403, message);
export const notFound = (message: string) => new AppError(404, message);
export const conflict = (message: string) => new AppError(409, message);
```

**Line by line:**

- Each helper is a one-line arrow function that builds an `AppError` with a fixed status.
- `badRequest` and `notFound` and `conflict` **require** a message — you must write
  `"Exam not found."` yourself, because only you know what was not found.
- `unauthorized` and `forbidden` have **default messages**. These situations always mean
  the same thing, so the default is the industry-standard wording and call sites stay
  short: `throw forbidden();`.
- Why helpers at all? Read these two lines and compare:

```ts
throw new AppError(404, "Exam not found.");   // you must remember 404 = not found
throw notFound("Exam not found.");            // reads like an English sentence
```

The second one is impossible to write wrong. You cannot accidentally say `notFound` and
pass 500.

### Chunk 4 — the two interfaces

```ts
interface FieldIssue {
  path: string;
  message: string;
}

interface MappedError {
  status: number;
  message: string;
  errors?: FieldIssue[];
}
```

**Line by line:**

- `FieldIssue` — one field problem: *which* input (`path`, e.g. `"phone"`) and *what is
  wrong* (`message`). This is the exact shape the client's `applyApiFieldErrors` reads.
- `MappedError` — the *safe answer* the error handler will send: a status, a message, and
  optionally a list of field issues.
- `errors?` — the `?` means optional. Only validation errors carry field issues.
- These interfaces exist so `mapError` (next chunk) has a fixed **return type**. Whatever
  error goes in — Mongoose, JWT, anything — the output is always this one safe shape.

### Chunk 5 — mapError, first half

```ts
const mapError = (err: unknown): MappedError => {
  if (err instanceof AppError && err.expose) {
    return { status: err.status, message: err.message };
  }

  if (err instanceof MongooseError.ValidationError) {
    return {
      status: 400,
      message: "Validation failed",
      errors: Object.entries(err.errors).map(([path, e]) => ({
        path,
        message: e.message,
      })),
    };
  }
```

**Line by line:**

- `(err: unknown)` — the input type is `unknown`, TypeScript's strictest type. "It is an
  error of some kind. I promise nothing about its shape." The whole function's job is to
  turn that unknown thing into a known `MappedError`.
- `err instanceof AppError && err.expose` — **our own errors are checked first.** If the
  error is an `AppError` *and* its message is safe to expose, pass both straight through.
  We wrote the message, so we can trust it.
- Why the `err.expose` check? An `AppError` with `expose: false` must NOT show its message.
  The check sends it falling through to the final `return { status: 500, … }` at the
  bottom. One flag, two behaviors.
- `err instanceof MongooseError.ValidationError` — Mongoose throws this when you
  `save()` a document that breaks its schema rules (a required field is missing, for
  example). It carries *field-level* detail inside `err.errors`.
- `Object.entries(err.errors)` — `err.errors` is an object like
  `{ phone: ValidationError, password: ValidationError }`. `Object.entries` turns it into
  an array of pairs: `[["phone", …], ["password", …]]`.
- `.map(([path, e]) => ({ path, message: e.message }))` — reshape each pair into our
  `FieldIssue` shape: `{ path: "phone", message: "Path `phone` is required." }`. The
  server's schema errors and the zod errors from `validate.ts` now look **identical** to
  the client — one code path on the form side.

### Chunk 6 — mapError, database errors

```ts
  if (err instanceof MongooseError.CastError) {
    return { status: 400, message: "Invalid id." };
  }

  const mongoErr = err as { code?: number; keyValue?: Record<string, unknown> };
  if (mongoErr?.code === 11000) {
    // Never the raw index name or the driver text.
    return { status: 409, message: "That already exists." };
  }
```

**Line by line:**

- `MongooseError.CastError` — thrown when you call `findById("hello")`. Mongo ids must be
  12-byte hex strings; `"hello"` cannot be cast to one. This is a **client mistake** (bad
  URL), so it answers 400, not 500.
- `const mongoErr = err as { code?: number; … }` — a **type cast** ("treat this unknown
  error as if it had a `code` field"). It is a cast, not a check, because MongoDB driver
  errors are plain objects, not classes we can `instanceof` against.
- `mongoErr?.code === 11000` — 11000 is MongoDB's **duplicate key** error code. You tried
  to insert a value that a unique index already contains (same phone number twice, for
  example).
- Why no `instanceof` here? The Mongo driver throws plain `Error` objects with a `code`
  property attached. There is no `DuplicateKeyError` class to check against — the number
  is the only reliable signal.
- The comment says the safety rule: the raw driver text contains **index names and
  collection names** — internal details. We answer with a fixed sentence instead.

### Chunk 7 — mapError, auth and upload errors

```ts
  if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
    return { status: 401, message: "Session expired. Please log in again." };
  }

  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return { status: 413, message: "File is too large." };
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return { status: 400, message: "Unexpected file field." };
    }
    return { status: 400, message: "File upload rejected." };
  }
```

**Line by line:**

- `TokenExpiredError || JsonWebTokenError` — two classes, one outcome. Whether the session
  token is expired or simply broken, the user's fix is the same: log in again. So both map
  to 401 with one message.
- `MulterError` with a `code` — Multer errors are *classified by string codes*, not
  classes. `LIMIT_FILE_SIZE` = the uploaded file was bigger than the configured maximum →
  413. `LIMIT_UNEXPECTED_FILE` = the upload came from a form field name the server did not
  expect → 400.
- The final `return { status: 400, … }` inside the Multer block — any other Multer problem
  is still an upload problem, still the client's side, so still 400.

### Chunk 8 — mapError, the last two exits

```ts
  // express.json() body-parser failures: SyntaxError with a status of 400.
  if (err instanceof SyntaxError) {
    const status = (err as { status?: number }).status;
    if (status && status >= 400 && status < 500) {
      return { status, message: "Invalid JSON body." };
    }
  }

  return { status: 500, message: "Internal Server Error" };
};
```

**Line by line:**

- `err instanceof SyntaxError` — when a request body is not valid JSON (a missing quote,
  a trailing comma), the `express.json()` body parser throws a plain JavaScript
  `SyntaxError`.
- `const status = (err as { status?: number }).status` — body-parser attaches a `status`
  property to its SyntaxError. We read it with a cast, same trick as the Mongo `code`.
- `status >= 400 && status < 500` — a safety check: only trust the attached status if it
  is a sensible 4xx. A random `SyntaxError` from our own code (a `JSON.parse` bug in a
  controller, say) has no status — it falls past this check.
- `return { status: 500, message: "Internal Server Error" };` — **the most important line
  in the file.** Every error that reaches this line answers with the *same generic text*.
  Real error messages from libraries can contain file paths, collection names, or query
  text. A hacker reads those. So unknown errors show nothing. The detail goes to the server
  log (in the handler, next chunk); the client gets five safe words.

> **The trick to remember:** known errors pass their own message; every unknown error
> answers `"Internal Server Error"`. The server log sees everything; the browser sees only
> what we wrote.

### Chunk 9 — the errorHandler itself

```ts
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    // Don't send again if headers already sent
    return next(err);
  }

  console.error(err);

  const mapped = mapError(err);
  res.status(mapped.status).json({
    success: false,
    message: mapped.message,
    ...(mapped.errors ? { errors: mapped.errors } : {}),
  });
};
```

**Line by line:**

- The signature `(err, _req, res, next)` — **four parameters**. This is not style; this
  is the signal Express uses to recognize an error middleware (section 7). Remove one and
  this function never runs.
- `err: unknown` — TypeScript forces us to check before using it. Exactly right for a
  function whose job is "inspect unknown things".
- `_req` — the underscore prefix means "I must accept this parameter to keep the 4-argument
  shape, but I do not use it."
- `if (res.headersSent) return next(err);` — the edge case. Sometimes the server already
  started answering (it sent `200` and the first bytes of a big file), and *then* an error
  happened. You cannot send a second answer — the HTTP response is already on its way.
  Calling `next(err)` hands the problem to Express's built-in final handler, which just
  closes the connection. Without this guard, Express would crash with
  "ERR_HTTP_HEADERS_SENT".
- `console.error(err)` — **before** mapping, always. The full error, with stack trace,
  lands in the server log. Even for `AppError`s — debugging needs the stack.
- `const mapped = mapError(err);` — turn anything into the safe shape.
- `res.status(mapped.status).json({ success: false, message: … })` — the envelope from
  Part 1, section 3, in real code.
- `...(mapped.errors ? { errors: mapped.errors } : {})` — a **conditional spread**. It
  means: "if there are field issues, add an `errors` key; otherwise add nothing." The
  response never contains `errors: undefined` — the key is simply absent. Small detail,
  but the client can then check `Array.isArray(body.errors)` cleanly.

---

## 9. Line by line: validate.ts

File: `server/src/middlewares/validate.ts` — the door guard. It checks the request **before**
the controller runs.

### Chunk 1 — the shape it validates

```ts
type ValidatedRequest = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
};

export function validate(schema: ZodType<ValidatedRequest>): RequestHandler {
```

**Line by line:**

- `ValidatedRequest` — a request has three places where user input arrives: the **body**
  (JSON you POST), the **query** (`?page=2` after the `?`), and the **params** (the `:id`
  part of the URL). The schema describes all three at once.
- `validate(schema)` — this function is a **middleware factory**: you give it a schema, it
  gives you back a middleware. That is why routes read
  `router.post("/x", validate(schema), controller)` — `validate(schema)` *is* the
  middleware, built fresh for that schema.
- `: RequestHandler` — the return type: a real Express middleware function.

### Chunk 2 — safeParse and the 400 answer

```ts
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
```

**Line by line:**

- `schema.safeParse(...)` — the word **safe** is the key difference from `schema.parse()`.
  `parse()` *throws* when data is wrong. `safeParse()` never throws — it returns an object
  that tells you the outcome: `{ success: true, data }` or `{ success: false, error }`.
  For a middleware, that is perfect: we want to answer the request, not throw.
- The comment above the `return` line (in the real file) is a security rule: **never log
  `req.body` here.** This middleware runs on login and password-reset routes. One
  `console.log(req.body)` writes plaintext passwords into server log files.
- `result.error.issues` — zod collects every problem, not just the first. Each issue has
  a `path` (where) and a `message` (what).
- `issue.path.slice(1).join(".")` — the interesting line. Because we validated
  `{ body: req.body, … }`, every path **starts with the container name**. A bad phone
  number produces the path `["body", "phone"]`. `.slice(1)` drops `"body"`, keeping
  `["phone"]`, and `.join(".")` makes the string `"phone"`. The client sees the field name
  it actually sent — it never needs to know we wrapped things.
- `|| issue.path.join(".")` — the fallback. If slicing leaves an empty array (the issue
  was about `body` itself, not a field inside it), join the original path so we never send
  an empty string.
- `return;` after `res.status(400).json(...)` — the middleware stops here. The controller
  never runs. Bad input never touches the database.

### Chunk 3 — writing the clean data back

```ts
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
```

**Line by line:**

- `req.body = result.data.body` — zod does not only *check*, it also *cleans*: it applies
  defaults, strips unknown keys, and converts types (`.coerce.number()` turns `"5"` into
  `5`). Writing the parsed result back means **the controller receives the cleaned
  version**, not the raw input. The controller can trust its data completely.
- `!== undefined` guards — only overwrite what the schema actually described.
- `Object.defineProperty(req, "query", …)` — the strange one. In Express 5, `req.query` is
  a **getter** (a computed property without a setter). Assigning to it directly
  (`req.query = x`) throws an error. `Object.defineProperty` replaces the property on the
  `req` object itself, bypassing the getter. The four options: `value` = the new query,
  `writable` = may be changed later, `configurable` = may be redefined later, `enumerable`
  = shows up when the object is listed.
- `next()` — validation passed. On to the controller.

> **The trick to remember:** `safeParse` never throws — it reports. And it returns
> *cleaned* data, which you write back so controllers never see raw input again.

---

## 10. How axios builds the error object

Part 1 said "axios throws on 4xx/5xx". Now let us open the machine.

### validateStatus — the switch inside axios

For every response, axios runs one check:

```ts
validateStatus: (status) => status >= 200 && status < 300
```

That is the default. If the function returns `true`, the promise **resolves**. If it
returns `false`, axios **rejects** the promise with a new `AxiosError` object. That one
boolean is the entire reason your `catch` block runs.

### The AxiosError object — what is inside

```ts
try {
  const res = await client.get("/exam");
} catch (error) {
  // error is an AxiosError with these parts:
  // error.config        — the request settings (url, method, headers, signal…)
  // error.request       — the low-level browser request (XMLHttpRequest)
  // error.response      — the server's answer: { status, data, headers }
  // error.isAxiosError  — true; the marker that says "I am an axios error"
  // error.message       — e.g. "Request failed with status code 404"
}
```

**Field by field:**

- `error.config` — everything about the request that was sent. We use it in the
  interceptor to read `error.config.url` and decide if this 401 should log the user out.
- `error.request` — the browser's raw request object. Present only if the request was
  actually sent.
- `error.response` — **the important one.** The server's real answer: `status` (404),
  `data` (our parsed envelope `{ success, message, errors }`), `headers`. Our message
  extraction lives entirely inside this field.
- `error.isAxiosError` — a marker flag. `axios.isAxiosError(error)` reads it.
- `error.message` — axios's own text like `"Request failed with status code 404"`. Note
  what it does **not** contain: our server's message. That is in
  `error.response.data.message`. Showing `error.message` to users is a classic mistake —
  it is technical and says nothing useful.

### The three failure shapes

Which fields exist depends on *where* things broke. This is the mental model:

```
1. Server answered with an error status        2. Request sent, no answer          3. Request never sent
   (4xx / 5xx)                                   (network down, timeout)             (bad setup, e.g. no URL)

   error.response  ✅ has it                     error.response  ❌ undefined        error.response  ❌ undefined
   error.request   ✅ has it                     error.request   ✅ has it           error.request   ❌ undefined
   → show the server's message                  → "Could not reach the server."     → setup bug; show fallback
```

Shape 2 is why `getApiErrorMessage` checks `!error.response` **first**: on Render's free
tier the server sleeps, and a sleeping server produces exactly this shape.

### `axios.isAxiosError(error)` — a type guard

The catch variable is typed `unknown` in TypeScript. You cannot touch `error.response`
until you prove the error is an axios error. `axios.isAxiosError(error)` is a **type
guard**: a function that checks at runtime (`isAxiosError === true`) *and* tells
TypeScript "inside the following `if`, treat `error` as an AxiosError". That is why this
pattern appears in every helper:

```ts
if (!axios.isAxiosError(error)) {
  return fallback; // not an axios error at all — a code bug somewhere
}
// TypeScript now allows error.response, error.config, …
```

---

## 11. Line by line: api-error.ts

File: `client/src/lib/api-error.ts` — one home for "read a message out of any error".

### Chunk 1 — the expected body shape

```ts
interface ApiErrorBody {
  message?: string;
  errors?: { path: string; message: string }[];
}
```

**Line by line:**

- This is the client-side mirror of the server's envelope. `message?` and `errors?` are
  both optional because old server versions (and other people's servers) may send neither.
- It is a local interface, not a shared import, on purpose: the client should *tolerate*
  shapes, not *require* them. If the server sends a slightly different body, the client
  still works and falls back to default text.

### Chunk 2 — statusDefault

```ts
function statusDefault(status: number): string | undefined {
  switch (true) {
    case status === 401:
      return "Please log in again.";
    case status === 403:
      return "You do not have permission to perform this action.";
    case status === 404:
      return "Not found.";
    case status === 413:
      return "That file is too large.";
    case status === 429:
      return "Too many requests. Please try again shortly.";
    case status >= 500:
      return "Something went wrong on our end.";
    default:
      return undefined;
  }
}
```

**Line by line:**

- `switch (true)` — looks strange, works simply: each `case` is an expression; the first
  one that evaluates to `true` wins. It is a tidy way to write "check these conditions in
  order" (here the order matters: `401` before `>= 500`).
- When is this used? When the server sent **no message of its own**. Old endpoints,
  proxies, or a future server change — the status code still tells us what kind of problem
  it was, so the user still gets a helpful sentence.
- `return undefined` — "no default for this status". The caller then falls to the
  fallback text.
- The comment in the real file notes the design point: this wording is **owned here,
  once**. Before this helper, five files had five different texts for 401.

### Chunk 3 — getApiErrorMessage

```ts
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    return "Could not reach the server.";
  }

  const body = error.response.data as ApiErrorBody | undefined;
  return (
    body?.message ||
    statusDefault(error.response.status) ||
    fallback
  );
}
```

**Line by line:**

- `error: unknown` — same strictness as the server's `mapError`. Any error can arrive.
- `fallback = "Something went wrong."` — a default argument, so callers may pass their own
  text (`getApiErrorMessage(error, "Failed to load exams.")`) or none.
- `if (!axios.isAxiosError(error)) return fallback;` — guard one: a non-axios error (a bug
  in our own code, a JSON.parse crash…) has no server message. Show the fallback.
- `if (!error.response) return "Could not reach the server.";` — guard two: failure shape
  2 from section 10. No answer arrived. This text is honest — the problem is the
  connection or the sleeping server, not the user and not the code.
- `const body = error.response.data as ApiErrorBody | undefined;` — read the parsed body
  with a tolerant cast. `undefined` is allowed: an empty body must not crash the helper.
- The `||` chain — the priority order, spelled out in code:
  1. `body?.message` — the server's own words, when it sent some. `?.` (optional
     chaining) means "if body is undefined, the whole expression is undefined, do not
     crash".
  2. `statusDefault(status)` — our standard text for this status.
  3. `fallback` — the last resort.
  
  `||` stops at the first value that is not empty. Because every message is a non-empty
  string, the chain can never return `undefined`.

> **The trick to remember:** server message → status default → fallback. One chain, in
> that order, in one function.

### Chunk 4 — getApiFieldErrors

```ts
export function getApiFieldErrors(
  error: unknown,
): { path: string; message: string }[] {
  if (!axios.isAxiosError(error) || !error.response) {
    return [];
  }
  const body = error.response.data as ApiErrorBody | undefined;
  if (!Array.isArray(body?.errors)) {
    return [];
  }
  return body.errors;
}
```

**Line by line:**

- Same two guards as before, on one line: not an axios error **or** no response → no
  field errors possible → empty array.
- `Array.isArray(body?.errors)` — defense against a *wrong shape*: if a server ever sent
  `errors: "something broke"` (a string, not an array), the `.map` on it would crash. One
  `Array.isArray` check makes the helper impossible to break.
- Returning `[]` (never `null`, never `undefined`) means callers can always write
  `for (const issue of getApiFieldErrors(error))` without checking first.

### Chunk 5 — applyApiFieldErrors

```ts
export function applyApiFieldErrors(
  error: unknown,
  fieldNames: readonly string[],
  setError: (path: never, issue: { message: string }) => void,
): boolean {
  let matched = false;
  for (const issue of getApiFieldErrors(error)) {
    if (fieldNames.includes(issue.path)) {
      (setError as (path: string, issue: { message: string }) => void)(
        issue.path,
        { message: issue.message },
      );
      matched = true;
    } else {
      toast.error(issue.message);
    }
  }
  return matched;
}
```

**Line by line:**

- `fieldNames: readonly string[]` — the list of the form's input names, e.g.
  `["phone", "password"]`. `readonly` promises "I will not change your array".
- `setError: (path: never, …)` — the typing trick worth understanding. Every
  react-hook-form `setError` is typed to *that form's* field names ("phone" for the login
  form, "title" for another). A shared helper cannot know every form's names, so it
  accepts the loosest possible signature and **casts at the call**
  (`setError as (path: string, …)`) when it is time to actually call. Runtime cost: zero.
  Type safety: kept at every call site.
- `for (const issue of …)` — loop over the server's field issues.
- `fieldNames.includes(issue.path)` — does this form have that input? If yes:
  `setError(issue.path, { message: issue.message })` — react-hook-form stores the message
  and shows it under the input in red. `matched = true`.
- `else toast.error(issue.message)` — the form does *not* have that input (maybe the
  server model changed). Showing nothing would silently hide the problem, so it becomes a
  toast. No server message is ever dropped.
- `return matched` — the caller's signal. `true` means "the errors are visible under
  inputs already — do not show another toast". `false` means "nothing matched — show your
  generic toast". This is why every form's catch reads:

```ts
if (!applyApiFieldErrors(error, ["phone", "password"], form.setError)) {
  toast.error(getApiErrorMessage(error, "Something went wrong. Please try again."));
}
```

---

## 12. Line by line: the axios client and interceptor

File: `client/src/utils/utils.ts` (the top of the file). Three pieces: the client, the
handler slot, and the interceptor.

### Chunk 1 — creating the client

```ts
const client = axios.create({
  baseURL:
    import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_PRODUCTION_API
      : import.meta.env.VITE_DEVELOPMENT_API,
  withCredentials: true,
  // Render's free tier sleeps; a cold start can take tens of seconds, and
  // without a timeout a hung request never resolves at all.
  timeout: 30000,
});
```

**Line by line:**

- `axios.create({...})` — one configured instance, shared by the whole app. Every page
  imports the *same* `client`, so every request gets the same rules. Using bare `axios`
  everywhere would mean configuring this 44 times.
- `baseURL` — the prefix on every request. Calling `client.get("/exam")` actually requests
  `https://api.poruya.com/exam`. The ternary picks the production or development API
  based on the build. (`import.meta.env` values are **baked in at build time** — they are
  not secrets; the whole bundle can read them. Only ever put public values there.)
- `withCredentials: true` — "send my cookie with every request." The login token lives in
  an httpOnly cookie (a cookie JavaScript cannot read — the safest place). Without this
  line, the browser would not attach it, and every authenticated request would fail with
  401.
- `timeout: 30000` — give up after 30 seconds. Without a timeout, a hung request leaves
  the user staring at a spinner *forever*, and the awaiting code never runs — not even
  the `catch`. 30 seconds is long on purpose: the comment explains that a cold-starting
  Render server can take tens of seconds.

### Chunk 2 — the unauthorized handler slot

```ts
// Registered by AuthProvider (see Auth-context.tsx): the interceptor lives at
// module scope where hooks are unavailable, so the provider injects the
// "session died, log in" behaviour from React-land.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}
```

**Line by line:**

- `let unauthorizedHandler: (() => void) | null = null;` — a **module-level variable**: a
  box that lives outside React, outside any component. It starts empty.
- Why does this box exist? We want the interceptor (which sees every 401) to log the user
  out. But logging out means updating React state in `Auth-context` — and the interceptor
  cannot import `Auth-context`, because `Auth-context` imports `client` (this file).
  Importing each other is a **circular import** — a real bug that breaks bundlers.
- `setUnauthorizedHandler(fn)` — the door into the box. `Auth-context` calls it once when
  the app boots and passes its logout function. From then on, the interceptor can call
  `unauthorizedHandler()` — React's function, called from axios-land, without any import.
- This pattern is called **dependency injection**: instead of the module *finding* its
  dependency (import), the dependency is *handed in* from outside.

### Chunk 3 — the allowlist

```ts
// These legitimately answer 401 and handle it themselves — a global logout
// redirect on top of their own handling would bounce a user mid-login.
const AUTH_401_ALLOWLIST = [
  "/auth/check-auth",
  "/auth/login-with-phone",
  "/auth/send-otp",
  "/auth/verify-otp",
  "/auth/create-user",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/verify-reset-otp",
  "/auth/reset-password",
];
```

**Line by line:**

- The problem this list solves: a 401 normally means "your session died". But on the
  login page, a 401 means something completely normal: "wrong password". The server
  answers 401 because the credentials are wrong — that is the *correct* status for bad
  credentials.
- Without the list, typing a wrong password would trigger the global logout → the user is
  thrown out of the login page while typing. Every endpoint that *legitimately* answers
  401 during normal use is therefore listed here.
- `/auth/check-auth` is first for a reason: it is the "am I still logged in?" call the app
  makes on every refresh. When it answers 401, that is the normal "no session yet"
  answer, not an emergency.

### Chunk 4 — the interceptor

```ts
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? "";
      if (unauthorizedHandler && !AUTH_401_ALLOWLIST.includes(url)) {
        unauthorizedHandler();
      }
    }
    return Promise.reject(error);
  },
);
```

**Line by line:**

- `client.interceptors.response.use(onFulfilled, onRejected)` — register two functions.
  `onFulfilled` runs for every **successful** response; `onRejected` runs for every
  **failed** one. We pass `(response) => response` — "success: pass it through untouched".
- `axios.isAxiosError(error) && error.response?.status === 401` — only axios errors, only
  a real 401 answer. `?.` again: no response (network down) must not crash the check.
- `const url = error.config?.url ?? "";` — read which URL failed, from `error.config`
  (section 10). `?? ""` turns missing into empty string so the `.includes` check below is
  always safe.
- `unauthorizedHandler && !AUTH_401_ALLOWLIST.includes(url)` — two conditions: a handler
  was registered (the app booted), and this URL is not on the allowlist.
- `unauthorizedHandler();` — call React's logout. The user lands on the login page with
  one clear message, no matter which of the 44 API calls noticed the dead session first.
- `return Promise.reject(error);` — **the line people forget.** An interceptor is a link
  in a chain. It can swallow the error (return a normal value) or pass it on. We pass it
  on, so the page that made the request still runs its own `catch` and can show its own
  error state. The interceptor adds behavior; it does not steal the error.

### Trace 2 — expired session, twenty requests, one logout

The user leaves a dashboard tab open for a week. They come back and click something. The
session cookie has expired.

| Step | Where | What happens |
|---|---|---|
| 1 | the dashboard | It fires requests for stats, exams, collections… say 20 at once. |
| 2 | the server | Every one answers 401 "Authentication required." |
| 3 | axios | Every one rejects → the interceptor's `onRejected` runs 20 times. |
| 4 | the interceptor | Each run: is it a 401? yes. Is the URL allowlisted? no. Call `unauthorizedHandler()`. |
| 5 | Auth-context | `unauthorizedHandler` clears the user state and navigates to `/login`. It is written to be safe when called many times — after the first call, the user is already logged out and the rest are no-ops. |
| 6 | each page's catch | `getApiErrorMessage` → "Please log in again." — but the user is already on the login page; the toasts use fixed IDs so they replace, not stack. |
| 7 | result | One clean logout. The user understands what happened. |

Before this existed: 20 identical toasts, no logout, and a page full of broken "0%" cards.

> **The trick to remember:** the interceptor is a chain link that *adds* behavior and
> always `Promise.reject`s the error onward.

---

## 13. Line by line: ErrorBoundary.tsx

File: `client/src/components/shared/ErrorBoundary.tsx` — the net under React itself.

### The one class component in this project

React has **no hook** that catches render crashes. The only mechanism React offers is a
class component with special lifecycle methods. That is why this is a class, and why no
amount of hooks can replace it.

```tsx
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
```

**Line by line:**

- `extends Component<{ children }, { error }>` — the two angle-bracket groups are the
  **props** type and the **state** type. Props: whatever we wrap inside. State: the error
  we caught, or null.
- `state = { error: null }` — class state starts empty. `error: null` means "no crash
  yet".

### Chunk 2 — the two special methods

```tsx
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Not toast.error: toasts live inside the tree that just threw.
    console.error("Uncaught render error:", error, info.componentStack);
  }
```

**Line by line:**

- These two methods are the error boundary itself. React calls them when a component
  *below this one in the tree* throws while rendering.
- `static getDerivedStateFromError(error)` — runs during the **render phase** (while React
  is still building the screen). Its only job: return the new state. Returning
  `{ error }` flips the switch; the next `render()` (below) shows the fallback instead of
  the crashed children. It must be pure — no side effects here, because React may run the
  render phase twice (more on that in the SEO document's StrictMode section).
- `componentDidCatch(error, info)` — runs after, during the **commit phase** (React has
  finished deciding what the screen shows). Side effects belong here. We log the error
  and `info.componentStack` — the *component* stack trace: "the crash happened inside
  DashboardCard inside AnalyticsPanel inside…". Far more useful than a plain stack when
  debugging React.
- The comment explains a subtle trap: `toast.error` would not work here. Toasts are React
  components, rendered inside the tree that just crashed. Asking the crashed tree to show
  a toast is asking the fire to put itself out. `console.error` works — it goes straight
  to the browser console.

### Chunk 3 — render

```tsx
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            The page hit an unexpected error and could not be shown. Reloading
            usually fixes it.
          </p>
          <button
            className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-sidebar"
            onClick={() => window.location.reload()}
          >
            Reload the page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Line by line:**

- `if (this.state.error)` — when an error was caught, draw the fallback: a full-screen
  message. Not technical. "Reloading usually fixes it" is honest — most render crashes
  come from a one-time bad state, and a fresh load clears it.
- `onClick={() => window.location.reload()}` — a **full page reload**, deliberately. Not
  React navigation. A full reload throws away every piece of broken state and starts from
  a clean HTML file. The strongest reset available.
- `return this.props.children` — the normal case: no error, render everything inside the
  boundary. In `main.tsx` the boundary wraps `<App />`, so "everything inside" is the
  whole application.

> **The trick to remember:** `getDerivedStateFromError` chooses what to show (render
> phase), `componentDidCatch` reports what happened (commit phase), and the fallback must
> not use anything from the crashed tree.

---

## 14. Line by line: the AbortController pattern

File: `client/src/pages/service-pages/question-bank/slug-1/slug-2/Question-bank-slug2.tsx`
(the questions effect). This is the race-condition fix from Part 1, section 5.8, in full.

### First: the useEffect lifecycle you need

React runs an effect's **cleanup function** at exactly two moments:

1. **Before the effect runs again** — because a dependency changed.
2. **When the component unmounts** (leaves the screen).

So on a dependency change, the order is always: *old cleanup → new effect*. That order is
the whole trick.

### The effect, chunk by chunk

```tsx
  useEffect(() => {
    const controller = new AbortController();

    const fetchQuestions = async () => {
      setLoading((prev) => ({ ...prev, question: true }));
      setLoadError(null);
```

**Line by line:**

- `const controller = new AbortController();` — created **inside** the effect. Every run
  of the effect gets a fresh controller. That is what ties "this request" to "this render
  of the effect".
- `setLoading(...)` / `setLoadError(null)` — every fetch starts optimistic: show loading,
  clear the old error. (If the old error stayed, a successful refetch would still show a
  red box.)

```tsx
      try {
        const res = await client.get(`/question?${params.toString()}`, {
          signal: controller.signal,
        });
```

- `signal: controller.signal` — hand the "cancel wire" to axios. Axios passes it to the
  browser. After this, calling `controller.abort()` cancels the request at the network
  level — not just ignored, actually cancelled.

```tsx
      } catch (error) {
        // A superseded request is not a failure — its replacement is in flight.
        if (axios.isCancel(error)) return;
        console.error(error);
        setLoadError(error);
```

- `if (axios.isCancel(error)) return;` — **the first check in every catch.** When a
  request is aborted, the promise rejects with a *cancel* error. Without this line, every
  cancelled request would set `loadError` — the user clicking quickly through the sidebar
  would see phantom red error boxes.
- `setLoadError(error)` — a real failure: store it. The render code then shows
  `ApiErrorState` with a Try again button.

```tsx
      } finally {
        if (!controller.signal.aborted) {
          setLoading((prev) => ({ ...prev, question: false }));
        }
      }
    };

    fetchQuestions();

    return () => controller.abort();
  }, [qDetails, reloadToken]);
```

- `finally` — runs on success AND failure. Good place for "stop the spinner".
- `if (!controller.signal.aborted)` — but only if *this* request was not cancelled. Two
  reasons. (1) If a newer fetch already started, the newer one owns the loading state;
  the old one setting it to `false` would hide the spinner while the new request is still
  running. (2) If the component unmounted, calling `setLoading` on a dead component is
  wrong (React 18+ no longer warns, but it is still meaningless work).
- `return () => controller.abort();` — **the cleanup**. Runs right before the effect runs
  again (dependency changed) and on unmount. This is the line that cancels the old
  request.
- `[qDetails, reloadToken]` — the dependencies. `qDetails` changes when the user clicks a
  different paper in the sidebar. `reloadToken` changes when the user clicks "Try again"
  (the trick from Part 1, section 5.5).

### Trace 3 — click paper A, then quickly click paper B

```
time →
1. Click A:  effect runs with qDetails=A. controller_A created. Request A starts.
2. Click B:  qDetails changes.
             a. cleanup runs first:        controller_A.abort()  → request A is CANCELLED
             b. effect runs again:         controller_B created. Request B starts.
3. Request B answers (fast server):
             axios resolves → setAllQuestion(B's questions) ✓ page shows paper B
4. Request A's cancellation arrives at its await point:
             axios rejects with a Cancel error
             catch: axios.isCancel(error) → true → return (no error state)
             finally: controller.signal.aborted → true → loading untouched
```

Without the AbortController, step 4 would instead be: "request A answers late, sets
allQuestion to A's questions" — and the page silently shows the **wrong paper**. That is
the race condition: not a crash, just quietly wrong data. The worst kind of bug.

> **The trick to remember:** cleanup-aborts-first is the useEffect contract that makes
> "only the newest request may touch state" automatic.

---

## 15. One full journey: a wrong password, start to finish

Everything from both parts, in one story. The user types the wrong password on the login
page and clicks Log in.

**On the client:**

1. `Login.tsx` — react-hook-form runs its **client-side** validation first (empty fields,
   wrong format). It fails fast, before any network work: messages appear under inputs,
   no request is sent.
2. Validation passes (the password is a valid-looking string — just not the right one;
   only the server can know that). `form.handleSubmit` calls the submit function.
3. The submit function calls `client.post("/auth/login-with-phone", { phone, password })`
   — `client/src/utils/utils.ts`. The request goes out with the cookie jar
   (`withCredentials`) and a 30-second timeout.

**On the server:**

4. `server/src/routes/auth-routes.ts` — the route matches. Two middleware sit in front of
   the controller; the first is `validate(loginSchema)`.
5. `validate.ts` — `safeParse` checks the body. Phone matches `^01\d{9}$`, password is
   long enough. **Passes.** (Client-side and server-side validation check different
   things: format versus truth.)
6. `auth-controller.ts` — `User.findOne({ phone, isVerified: true, provider: "phone" })`.
   The user exists. `bcryptjs.compare(password, user.password)` hashes the typed password
   and compares it to the stored hash. **No match.**
7. The controller answers directly (it predates the AppError refactor — same envelope,
   same status):

```ts
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }
```

   Note the comment just above it in the real file: "no such user" and "wrong password"
   answer **identically**. If they differed, an attacker could test which phone numbers
   have accounts. That is called *user enumeration*, and one shared vague message blocks
   it.

**Back on the client:**

8. axios — status 401 fails `validateStatus` (section 10). The promise **rejects** with an
   `AxiosError` holding `response.status = 401` and `response.data.message = "Invalid
   credentials"`.
9. the interceptor (`utils.ts`) — is it a 401? Yes. Is `/auth/login-with-phone` on
   `AUTH_401_ALLOWLIST`? **Yes** — so no global logout. The user stays on the login page,
   mid-typing. `Promise.reject(error)` passes the error to the page.
10. `Login.tsx` catch:

```ts
} catch (error) {
  if (!applyApiFieldErrors(error, ["phone", "password"], form.setError)) {
    toast.error(getApiErrorMessage(error, "Failed to log in."));
  }
}
```

11. `applyApiFieldErrors` — the 401 body has no `errors` array, so `getApiFieldErrors`
    returns `[]`, the loop runs zero times, and it returns `false`.
12. `getApiErrorMessage(error, "Failed to log in.")` — it is an axios error; there is a
    response; `body.message` = `"Invalid credentials"` → **that** is the message.
13. `toast.error("Invalid credentials")` — one red toast. The user knows the login
    failed, stays on the page, and tries again.

Thirteen steps, five files, one clear message — and at no point did an internal detail,
a stack trace, or a raw library message reach the screen.

---

*Part 2 sources: `server/src/middlewares/errorHandler.ts`, `server/src/middlewares/validate.ts`,
`server/src/controllers/auth-controller.ts` (login), `client/src/lib/api-error.ts`,
`client/src/utils/utils.ts`, `client/src/components/shared/ErrorBoundary.tsx`,
`client/src/pages/service-pages/question-bank/slug-1/slug-2/Question-bank-slug2.tsx`.*
