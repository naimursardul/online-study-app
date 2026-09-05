import { Link } from "react-router-dom";
import { LegalPage, LegalSection } from "@/components/legal/Legal";

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="5 September 2026"
      intro="This explains what Poruya collects, why, and what you can ask us to do about it. We've kept it in plain language rather than legal boilerplate, because most of our users are students."
    >
      <LegalSection heading="1. What we collect">
        <p>
          <strong className="text-foreground">
            Information you give us when you sign up.
          </strong>{" "}
          Your phone number and password, your name, and your level and
          background (for example which class and which group you're in). You can
          optionally add an email address and a profile picture. Your phone number
          is your login — it's the one piece of personal information we genuinely
          need.
        </p>
        <p>
          <strong className="text-foreground">What you do while studying.</strong>{" "}
          The exams you generate, the answers you submit, your scores, and which
          questions you save into collections. From your answers we work out a
          per-topic record of what you're getting right, which is what makes the
          weak-topic exams and the dashboard possible.
        </p>
        <p>
          <strong className="text-foreground">Technical information.</strong> Like
          any website, our hosting and analytics see basic request data — pages
          visited, approximate region, device and browser type. We don't build
          advertising profiles from it.
        </p>
        <p>
          <strong className="text-foreground">Anything you send us.</strong> If
          you email us or use the contact form, we keep that message so we can
          reply.
        </p>
      </LegalSection>

      <LegalSection heading="2. Why we use it">
        <ul>
          <li>
            To create your account, sign you in and keep you signed in, and to let
            you reset your password.
          </li>
          <li>
            To show you the right content — your level and background decide which
            subjects, chapters and topics appear.
          </li>
          <li>
            To run mock exams, grade them, and build your dashboard and weak-topic
            analysis.
          </li>
          <li>
            To keep the service working and secure — spotting abuse, debugging
            failures, and rate-limiting requests.
          </li>
          <li>
            To reply to you when you contact us, and to reach you about your
            account if we need to.
          </li>
        </ul>
        <p>
          We do not sell your personal information, and we don't share it with
          advertisers.
        </p>
      </LegalSection>

      <LegalSection heading="3. Cookies and local storage">
        <p>
          When you sign in we set a single session cookie holding your login
          token. It's <span className="text-foreground">httpOnly</span>, meaning
          scripts on the page can't read it, and it exists so you don't have to
          log in on every visit. It isn't used for tracking or advertising.
        </p>
        <p>
          We also store two small values in your browser's local storage: your
          light or dark theme choice, and a flag noting you've signed in here
          before so we can skip the wrong screen next time. Both stay on your
          device.
        </p>
      </LegalSection>

      <LegalSection heading="4. Analytics">
        <p>
          We use Vercel Analytics to count page views and understand which parts
          of the site people actually use. It's privacy-oriented by design — it
          doesn't set tracking cookies and doesn't follow you across other
          websites. We use it to decide what to build next, not to identify you.
        </p>
      </LegalSection>

      <LegalSection heading="5. Who else processes your data">
        <p>
          We keep the list short and use each of these only to run the service:
        </p>
        <ul>
          <li>
            <strong className="text-foreground">Vercel</strong> — hosting the
            website and the analytics described above.
          </li>
          <li>
            <strong className="text-foreground">MongoDB Atlas</strong> — the
            database holding accounts, questions and exam records.
          </li>
          <li>
            <strong className="text-foreground">Cloudflare R2</strong> — storage
            and delivery for images, including figures in questions and profile
            pictures.
          </li>
          <li>
            <strong className="text-foreground">Redis</strong> — short-lived
            caching so pages load faster.
          </li>
          <li>
            <strong className="text-foreground">Resend</strong> — sending email,
            such as replies to messages you send us.
          </li>
        </ul>
        <p>
          We may also disclose information if the law requires it, or to protect
          the service and its users from abuse.
        </p>
      </LegalSection>

      <LegalSection heading="6. How long we keep it">
        <p>
          We keep your account and study history for as long as your account
          exists, because your progress record only means something over time. If
          you ask us to delete your account, we remove your personal information
          and your exam history. We may keep anonymous, aggregated counts that
          can't be traced back to you, and anything we're legally required to
          retain.
        </p>
      </LegalSection>

      <LegalSection heading="7. Students under 18">
        <p>
          Poruya is built for board and admission exam preparation, so many of our
          users are school-age. We only collect what the product needs to work —
          we don't ask for an address, a date of birth, an institution, or a
          school ID. If you are a parent or guardian and want to see or delete
          what we hold about your child, email us and we'll help.
        </p>
      </LegalSection>

      <LegalSection heading="8. Security">
        <p>
          Passwords are stored hashed, never in plain text. Session tokens are
          held in an httpOnly cookie, and resetting your password invalidates
          sessions that were still using the old one. Correct answers and
          explanations for a live exam aren't sent to your browser until you
          submit. No system is perfectly secure, but we treat your data as
          something worth protecting.
        </p>
      </LegalSection>

      <LegalSection heading="9. What you can ask us for">
        <p>
          You can ask us for a copy of what we hold about you, ask us to correct
          it, or ask us to delete your account and its data. You can edit your own
          name, level and background from your profile at any time. Email{" "}
          <a href="mailto:contact@poruya.com">contact@poruya.com</a> from the
          account you're asking about, and we'll respond as quickly as we
          reasonably can.
        </p>
      </LegalSection>

      <LegalSection heading="10. Changes to this policy">
        <p>
          As the product grows this policy will change with it — the date at the
          top shows the last update. If we start collecting something meaningfully
          different, we'll say so rather than quietly editing this page.
        </p>
      </LegalSection>

      <LegalSection heading="11. Contact">
        <p>
          Any question about your data, or anything in here you'd like explained:{" "}
          <a href="mailto:contact@poruya.com">contact@poruya.com</a>. Our{" "}
          <Link to="/terms">Terms &amp; Conditions</Link> cover the rest of your
          use of Poruya.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
