import { useApolloClient, useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AuthShell, Field, focusFirstError, passwordHint } from "../../components/Auth/Auth";
import { Meta } from "../../components/Home/Meta";
import { Navbar } from "../../components/Navbar/Navbar";
import { ChangePasswordDocument, CheckPasswordResetLinkDocument } from "../../graphql/generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";

type LinkState = "checking" | "valid" | "expired" | "error" | "complete";

function ResetForm({ token }: { token: string }) {
  const apollo = useApolloClient();
  const [state, setState] = useState<LinkState>("checking");
  const [attempt, setAttempt] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [changePassword, { loading }] = useMutation(ChangePasswordDocument);
  const completed = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return;
    const controller = new AbortController();
    void apollo.mutate({
      mutation: CheckPasswordResetLinkDocument,
      variables: { token },
      context: { fetchOptions: { signal: controller.signal } },
      fetchPolicy: "no-cache",
    }).then(({ data }) => {
      if (!controller.signal.aborted) setState(data?.checkPasswordResetLink ? "valid" : "expired");
    }).catch(() => {
      if (!controller.signal.aborted) setState("error");
    });
    return () => controller.abort();
  }, [apollo, attempt, token]);

  useEffect(() => {
    if (state === "complete") completed.current?.focus();
  }, [state]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setErrors({});
    try {
      const password = String(new FormData(form).get("password"));
      const { data } = await changePassword({ variables: { token, password } });
      if (data?.changePassword.errors?.length) {
        const fields = toErrorMap(data.changePassword.errors);
        if (fields.token) setState("expired");
        else {
          setErrors(fields);
          focusFirstError(form, fields);
        }
      } else if (data?.changePassword.user) {
        setState("complete");
        void apollo.resetStore().catch(() => undefined);
      } else {
        setErrors({ form: "Could not reset your password. Please try again." });
      }
    } catch {
      setErrors({ form: "Could not reset your password. Please try again." });
    }
  }

  if (state === "expired" || !/^[A-Za-z0-9_-]{43}$/.test(token)) return (
    <>
      <p role="status">This reset link is invalid, expired, or has already been used.</p>
      <Link className="action justify-self-start" href="/forgot-password">Request a new link</Link>
    </>
  );
  if (state === "error") return (
    <>
      <p className="field-error" role="alert">Could not check your reset link.</p>
      <button type="button" className="action action--secondary justify-self-start" onClick={() => { setState("checking"); setAttempt(attempt + 1); }}>Try again</button>
    </>
  );
  if (state === "complete") return (
    <>
      <p ref={completed} tabIndex={-1} role="status">Your password has been changed. You’re signed in.</p>
      <Link className="action justify-self-start" href="/">Browse latest shares</Link>
    </>
  );
  if (state === "checking") return <p role="status">Checking your reset link…</p>;
  return (
    <form className="auth-form" onSubmit={submit} aria-busy={loading}>
      <Field name="password" label="New password" type="password" autoComplete="new-password" hint={passwordHint}
        required minLength={8} maxLength={128} error={errors.password} />
      {errors.form && <p role="alert" className="field-error">{errors.form}</p>}
      <button type="submit" className="action submit" disabled={loading}>{loading ? "Changing password…" : "Change password"}</button>
    </form>
  );
}

export default function ChangePassword() {
  const { isReady, query } = useRouter();
  const token = typeof query.token === "string" ? query.token : "";
  return (
    <>
      <Meta title="Reset password | I'm Listening" description="Set a new password." />
      <Navbar />
      <AuthShell title="Reset password">
        {isReady ? <ResetForm key={token} token={token} /> : <p role="status">Checking your reset link…</p>}
      </AuthShell>
    </>
  );
}
