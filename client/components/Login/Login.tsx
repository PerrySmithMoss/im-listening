import { useApolloClient, useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type FormEvent } from "react";
import { AuthShell, Field, focusFirstError } from "../Auth/Auth";
import { GoogleContinue } from "../GoogleAuth/GoogleAuth";
import { LoginUserDocument } from "../../graphql/generated/graphql";
import { authHref, returnPath } from "../../lib/returnPath";
import { toErrorMap } from "../../utils/toErrorMap";

export function Login() {
  const router = useRouter();
  const apollo = useApolloClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState("");
  const [mutate, { loading }] = useMutation(LoginUserDocument);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setErrors({});
    setRequestError("");
    try {
      const { data } = await mutate({ variables: { email: String(fields.get("email")), password: String(fields.get("password")) } });
      if (data?.loginUser.errors?.length) {
        const fields = toErrorMap(data.loginUser.errors);
        setErrors(fields);
        focusFirstError(form, fields);
      } else if (data?.loginUser.user) {
        await apollo.resetStore();
        await router.replace(returnPath(router.query.next));
      } else {
        setRequestError("Could not log in. Please try again.");
      }
    } catch {
      setRequestError("Could not log in. Please try again.");
    }
  }

  return (
    <AuthShell title="Log in" intro="Share a song or find your next favourite." illustrated>
      <GoogleContinue entry="/login" />
      <form className="auth-form" onSubmit={submit} aria-busy={loading}>
        <Field name="email" label="Email address" type="email" autoComplete="email" maxLength={190} error={errors.email} required />
        <Field name="password" label="Password" type="password" autoComplete="current-password" maxLength={128} error={errors.password} required />
        <Link className="inline-link justify-self-start" href="/forgot-password">Forgot your password?</Link>
        {requestError && <p className="field-error" role="alert">{requestError}</p>}
        <button type="submit" className="action submit" disabled={loading}>{loading ? "Logging in…" : "Log in"}</button>
      </form>
      <p>New here? <Link className="inline-link" href={authHref("/sign-up", router.query.next)}>Create an account</Link></p>
    </AuthShell>
  );
}
