import { useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AuthShell, Field } from "../components/Auth/Auth";
import { useCooldown } from "../components/Auth/useCooldown";
import { ForgotPasswordDocument } from "../graphql/generated/graphql";
import { Meta } from "../components/Home/Meta";
import { Navbar } from "../components/Navbar/Navbar";

export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [forgotPassword, { loading }] = useMutation(ForgotPasswordDocument);
  const { remaining, start } = useCooldown(60);
  const completion = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (sentTo) completion.current?.focus();
  }, [sentTo]);

  async function send(email: string) {
    setError("");
    try {
      const { data } = await forgotPassword({ variables: { email } });
      if (!data?.forgotPassword) throw new Error();
      setSentTo(email);
      start();
    } catch {
      setError("Could not request a reset link. Please try again later.");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(String(new FormData(event.currentTarget).get("email")).trim());
  }

  return (
    <>
      <Meta title="Forgot password | I'm Listening" description="Request a password reset link." />
      <Navbar />
      <AuthShell title="Forgot password" intro="Request a link to set a new password.">
        {sentTo ? (
          <div className="auth-form">
            <h2 className="section-title" tabIndex={-1} ref={completion}>Check your email</h2>
            <p>If an account with a password exists for <strong className="wrap-anywhere">{sentTo}</strong>, we’ll send a reset link. Check your spam folder if it doesn’t arrive.</p>
            <button type="button" className="action action--secondary justify-self-start" disabled={loading || remaining > 0} onClick={() => void send(sentTo)}>
              {loading ? "Sending…" : remaining ? `Send again in ${remaining}s` : "Send another link"}
            </button>
            {remaining === 60 && <p className="sr-only" role="status">Reset link requested.</p>}
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit} aria-busy={loading}>
            <Field name="email" label="Email address" type="email" autoComplete="email" maxLength={190} required />
            <button type="submit" className="action submit" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</button>
          </form>
        )}
        {error && <p className="field-error" role="alert">{error}</p>}
        <Link href="/login" className="inline-link justify-self-start">Back to log in</Link>
      </AuthShell>
    </>
  );
}
