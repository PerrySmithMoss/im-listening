import { PolicyPage, PolicySection, supportEmail } from "../components/PolicyPage/PolicyPage";

export default function Privacy() {
  return (
    <PolicyPage title="Privacy policy">
      <p>
        Perry Smith-Moss operates I&apos;m Listening, a site for sharing music. For questions about this policy
        or your personal data, email <a className="underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>.
      </p>
      <PolicySection title="Accounts and posts">
        <p>
          When you register, we collect your name, username and email address to run your account.
          If you use a password, we store a password hash. We use your email address for account
          verification, password resets and replies to your requests. You can browse public posts
          without an account.
        </p>
        <p>
          Music posts are public and can be displayed alongside your public profile. Your account
          email stays private. Where UK data protection law applies, we process account details and
          posts to provide the service you request. We use request information such as IP addresses
          and authentication outcomes for our legitimate interests in operating and securing the site
          and limiting abuse.
        </p>
      </PolicySection>
      <PolicySection title="Google sign-in">
        <p>
          If you choose Google sign-in when it is available, Google provides an account identifier, an
          email address and information about whether Google has verified that address. We use the
          identifier to connect Google sign-in to your I&apos;m Listening account and use verified email
          information to check your contact address during registration. We may ask you to verify
          that you can receive mail at that address.
        </p>
        <p>
          We store the Google account identifier with your account while it is connected. We use Google
          tokens to verify sign-in and discard them after the check. We request basic sign-in information
          and do not access your Gmail, Google Drive or contacts. Google handles authentication under its
          own <a className="underline" href="https://policies.google.com/privacy">privacy policy</a>.
        </p>
      </PolicySection>
      <PolicySection title="Cookies, service providers and retention">
        <p>
          A session cookie keeps you signed in. Sessions expire within seven days and may expire
          sooner after inactivity. Temporary authentication records, email codes and rate-limit counters
          expire automatically. Your browser also stores your colour scheme preference.
        </p>
        <p>
          Vercel hosts the website, IONOS hosts the API and database, and Resend delivers account emails.
          These providers process the information needed to deliver their services. External music
          images and previews, when used, are requested from their hosts by your browser. Some providers
          may process information outside the UK. Contact us for details of the applicable safeguards.
        </p>
        <p>
          We keep account information while your account is active. Public posts stay available until
          you or we remove them. We may retain limited records for security, legal obligations or
          resolving disputes for as long as those purposes require.
        </p>
      </PolicySection>
      <PolicySection title="Your choices and rights">
        <p>
          You can delete your own posts. If you have another way to sign in, you can disconnect Google
          from your sign-in settings. You can also revoke the app&apos;s access in your Google Account.
        </p>
        <p>
          Email us to request access, correction, deletion, restriction or a copy of your data.
          Depending on the circumstances, you have the right to object to processing based on our
          legitimate interests. You can also complain to the{" "}
          <a className="underline" href="https://ico.org.uk/make-a-complaint/">Information Commissioner&apos;s Office</a>.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
