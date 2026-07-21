import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — FoodHub",
  description:
    "Learn how FoodHub collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "July 21, 2026";
const CONTACT_EMAIL = "mahinulislam0611@gmail.com"; // TODO: replace with your real support email

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-neutral-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="mt-8 space-y-8 text-sm leading-6 text-neutral-700">
        <section>
          <p>
            FoodHub (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates
            the FoodHub website and meal ordering platform (the
            &quot;Service&quot;). This Privacy Policy explains what information
            we collect, how we use it, and the choices you have. By using the
            Service, you agree to the practices described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            1. Information we collect
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Account information.</strong> When you create an account
              we collect your name, email address, password (stored in hashed
              form), and optionally your phone number and role (customer or
              meal provider).
            </li>
            <li>
              <strong>Social login information.</strong> If you sign in with
              Google or Facebook, we receive your name, email address, and
              profile picture from that provider. We never receive or store
              your Google or Facebook password.
            </li>
            <li>
              <strong>Order information.</strong> When you place an order we
              collect your delivery address, contact number, and details of
              the meals you ordered.
            </li>
            <li>
              <strong>Provider information.</strong> If you register as a meal
              provider, we collect the details of the meals and categories you
              publish on the platform.
            </li>
            <li>
              <strong>Reviews and ratings.</strong> Reviews you leave on meals
              are stored together with your account name.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            2. How we use your information
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>To create and manage your account and keep you signed in.</li>
            <li>To process and deliver your meal orders.</li>
            <li>
              To let providers manage their meals and fulfil incoming orders.
            </li>
            <li>
              To send essential account emails, such as email verification
              messages.
            </li>
            <li>To improve the Service and keep it safe and secure.</li>
          </ul>
          <p className="mt-3">
            We do <strong>not</strong> sell your personal information, and we
            do not use it for third-party advertising.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            3. Cookies and sessions
          </h2>
          <p className="mt-3">
            We use a small number of essential cookies to keep you signed in
            after you log in. These cookies are required for the Service to
            work and are not used to track you across other websites. You can
            delete cookies at any time from your browser settings, which will
            sign you out.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            4. Third-party services
          </h2>
          <p className="mt-3">
            We rely on a small set of trusted third parties to run the
            Service:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Google</strong> and <strong>Facebook (Meta)</strong> for
              optional social login.
            </li>
            <li>
              <strong>Hosting providers</strong> that run our website, API,
              and database infrastructure.
            </li>
            <li>
              <strong>Email delivery services</strong> used to send account
              emails.
            </li>
          </ul>
          <p className="mt-3">
            These providers only receive the information they need to perform
            their function, and each is governed by its own privacy policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            5. Data retention
          </h2>
          <p className="mt-3">
            We keep your account information for as long as your account is
            active. Order history is retained so that you and your meal
            providers can view past orders. If you delete your account, we
            remove your personal information as described in the next section.
          </p>
        </section>

        <section id="data-deletion">
          <h2 className="text-lg font-semibold text-neutral-900">
            6. Data deletion
          </h2>
          <p className="mt-3">
            You can request deletion of your account and associated personal
            data at any time:
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              Email us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-brand-600 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              from the email address linked to your account with the subject
              line &quot;Delete my account&quot;.
            </li>
            <li>
              We will verify the request and permanently delete your account,
              profile information, and social login connections within 30
              days.
            </li>
            <li>
              If you signed in with Facebook, you can also remove FoodHub from
              your Facebook account under{" "}
              <em>Settings &amp; privacy → Apps and websites</em>, and then
              send us a deletion request for any remaining data.
            </li>
          </ol>
          <p className="mt-3">
            Some records may be retained where required for legal, security,
            or fraud-prevention purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            7. Security
          </h2>
          <p className="mt-3">
            We use industry-standard measures to protect your information,
            including encrypted connections (HTTPS), hashed passwords, and
            secure session cookies. No method of transmission or storage is
            100% secure, but we work to protect your data using reasonable
            safeguards.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            8. Children&apos;s privacy
          </h2>
          <p className="mt-3">
            The Service is not directed to children under 13, and we do not
            knowingly collect personal information from children under 13. If
            you believe a child has provided us with personal information,
            please contact us so we can delete it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            9. Changes to this policy
          </h2>
          <p className="mt-3">
            We may update this Privacy Policy from time to time. When we do,
            we will update the &quot;Last updated&quot; date at the top of
            this page. Significant changes will be communicated through the
            Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">
            10. Contact us
          </h2>
          <p className="mt-3">
            If you have any questions about this Privacy Policy or how we
            handle your data, contact us at{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-brand-600 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}