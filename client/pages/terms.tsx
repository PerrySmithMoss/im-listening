import Link from "next/link";
import { PolicyPage, PolicySection, supportEmail } from "../components/PolicyPage/PolicyPage";

export default function Terms() {
  return (
    <PolicyPage title="Terms of service">
      <p>These terms apply when you use I&apos;m Listening, a music-sharing site operated by Perry Smith-Moss.</p>
      <PolicySection title="Your account">
        <p>
          Keep your sign-in details secure and use an email address you can access. You are responsible
          for what you post from your account. If you think someone else has accessed it, contact us.
        </p>
      </PolicySection>
      <PolicySection title="Sharing music">
        <p>
          Posts are public. Only submit content you have the right to share. You keep ownership of
          your content and give I&apos;m Listening permission to store and display it on the site for as
          long as you keep it posted.
        </p>
        <p>
          Do not use the site to impersonate others, harass people, post unlawful or infringing content,
          send spam, or interfere with the service. We may remove posts or suspend accounts to enforce
          these rules or meet legal obligations.
        </p>
      </PolicySection>
      <PolicySection title="Availability and changes">
        <p>
          Features may change or become temporarily unavailable. If we make significant changes to
          these terms, we will post the updated terms here. Your statutory rights apply.
        </p>
      </PolicySection>
      <PolicySection title="Privacy and contact">
        <p>
          Our <Link className="underline" href="/privacy">privacy policy</Link> explains how we handle
          personal data. For questions, reports or account help, email{" "}
          <a className="underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
