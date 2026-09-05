import { Link } from "react-router-dom";
import { LegalPage, LegalSection } from "@/components/legal/Legal";

export default function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      lastUpdated="5 September 2026"
      intro="These terms cover your use of Poruya — our question bank, question explorer, mock exams and the rest of the website. Please read them. If you don't agree with them, don't use the service."
    >
      <LegalSection heading="1. Accepting these terms">
        <p>
          By creating an account or using Poruya, you agree to these terms. If
          you are using Poruya on behalf of someone else — a student you are
          responsible for, for example — you confirm you have the authority to
          accept these terms for them.
        </p>
      </LegalSection>

      <LegalSection heading="2. Who can use Poruya">
        <p>
          Poruya is built for students preparing for board and admission exams
          in Bangladesh, so many of our users are under 18. If you are under 18,
          you may use Poruya with the knowledge and permission of a parent or
          guardian. A parent or guardian who lets a student use their account
          accepts these terms on that student's behalf.
        </p>
      </LegalSection>

      <LegalSection heading="3. Your account">
        <ul>
          <li>
            You sign up with a phone number and a password. Use a number that is
            actually yours.
          </li>
          <li>
            One account per person. Accounts are personal — don't share your
            login with classmates or sell access to it.
          </li>
          <li>
            You are responsible for keeping your password private and for
            everything that happens under your account. Tell us at{" "}
            <a href="mailto:contact@poruya.com">contact@poruya.com</a> if you
            think someone else is using it.
          </li>
          <li>
            Give us accurate information. Your level and background decide which
            subjects and chapters you see, so wrong details just make the product
            worse for you.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <p>While using Poruya, you agree not to:</p>
        <ul>
          <li>
            scrape, crawl, bulk-download or otherwise systematically copy the
            question bank, or republish it anywhere else;
          </li>
          <li>
            resell, sublicense or redistribute our content, in print or online,
            without written permission;
          </li>
          <li>
            attempt to break, overload, probe or bypass any part of the service,
            its authentication or its rate limits;
          </li>
          <li>
            use automated tools to create accounts or submit exams, or interfere
            with anyone else's use of the service;
          </li>
          <li>
            upload or transmit anything unlawful, abusive or malicious through
            any part of the site.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Content and intellectual property">
        <p>
          Questions in the bank are drawn from real past board and admission
          examination papers. Those papers are public examination material, and
          we reproduce the questions for educational use.
        </p>
        <p>
          What is ours is the work built around them: the way questions are
          organised into levels, subjects, chapters and topics, the institution
          and year tagging, the explanations and model answers we write, the
          exam generation and analytics, and the software and design of the site.
          You may use all of it for your own study. You may not copy it into a
          competing product.
        </p>
        <p>
          If you hold rights in material you believe we have used incorrectly,
          email <a href="mailto:contact@poruya.com">contact@poruya.com</a> with
          enough detail to identify it and we will review and remove it where the
          request is valid.
        </p>
      </LegalSection>

      <LegalSection heading="6. No guarantee of results">
        <p>
          Poruya is a practice tool. It does not predict, promise or guarantee
          any exam result, admission outcome or grade. We also don't claim the
          bank covers every question that could appear on your exam. Use it
          alongside your own syllabus, teachers and books.
        </p>
        <p>
          We work to keep questions, answers and explanations accurate — every
          question is reviewed by an editor before it is published — but mistakes
          are possible. If you spot one, tell us and we'll fix it.
        </p>
      </LegalSection>

      <LegalSection heading="7. Price during early access">
        <p>
          Poruya is free while we are in early access. There is no payment system
          in the product today, so there is nothing to cancel and no card to
          enter. We may introduce paid plans later. If we do, we will announce it
          before it takes effect, and using paid features will always be a choice
          you make deliberately.
        </p>
      </LegalSection>

      <LegalSection heading="8. The service will change">
        <p>
          We are early, and we are still building. Features may be added,
          changed or removed, and parts of the site may be unavailable while we
          work on them. We don't promise uninterrupted access or that any
          specific feature will keep existing in its current form.
        </p>
      </LegalSection>

      <LegalSection heading="9. Suspension and termination">
        <p>
          You can stop using Poruya at any time, and you can ask us to delete
          your account by emailing{" "}
          <a href="mailto:contact@poruya.com">contact@poruya.com</a>. We may
          suspend or close an account that breaks these terms — particularly the
          acceptable use rules — or where we are required to by law. Where it is
          reasonable to do so, we'll tell you why first.
        </p>
      </LegalSection>

      <LegalSection heading="10. Liability">
        <p>
          Poruya is provided as it is, without warranties beyond those the law
          requires us to give. To the extent the law allows, we are not liable
          for indirect or consequential losses arising from your use of the
          service, including exam results, missed admissions or lost study time.
          Nothing here limits any liability that cannot be limited by law.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to these terms">
        <p>
          We may update these terms as the product develops. The date at the top
          of this page shows the last change. If a change materially affects you,
          we'll make an effort to flag it in the app rather than quietly editing
          this page. Continuing to use Poruya after a change means you accept the
          updated terms.
        </p>
      </LegalSection>

      <LegalSection heading="12. Governing law">
        <p>
          These terms are governed by the laws of Bangladesh, and the courts of
          Bangladesh have jurisdiction over any dispute arising from them.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact">
        <p>
          Questions about these terms, or anything else:{" "}
          <a href="mailto:contact@poruya.com">contact@poruya.com</a>. See also
          our <Link to="/privacy">Privacy Policy</Link> for how we handle your
          data.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
