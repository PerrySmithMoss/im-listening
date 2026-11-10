import { useApolloClient, useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type FormEvent } from "react";
import { RegisterUserDocument } from "../../graphql/generated/graphql";
import { authHref, returnPath } from "../../lib/returnPath";
import { toErrorMap } from "../../utils/toErrorMap";
import { AuthShell, Field, RegistrationFields, RegistrationLegal, focusFirstError, passwordHint } from "../Auth/Auth";
import { GoogleContinue } from "../GoogleAuth/GoogleAuth";

export function SignUp() {
  const router = useRouter();
  const apollo = useApolloClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState("");
  const [mutate, { loading }] = useMutation(RegisterUserDocument);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const variables = {
      firstName: String(fields.get("firstName")), lastName: String(fields.get("lastName")),
      username: String(fields.get("username")), email: String(fields.get("email")), password: String(fields.get("password")),
    };
    setErrors({});
    setRequestError("");
    try {
      const { data } = await mutate({ variables });
      if (data?.registerUser.errors?.length) {
        const fields = toErrorMap(data.registerUser.errors);
        setErrors(fields);
        focusFirstError(form, fields);
      } else if (data?.registerUser.user) {
        await apollo.resetStore();
        await router.replace(returnPath(router.query.next));
      } else {
        setRequestError("Could not create your account. Please try again.");
      }
    } catch {
      setRequestError("Could not create your account. Please try again.");
    }
  }

  return (
    <AuthShell title="Create your account" intro="Join the community and share the songs you love." illustrated>
      <GoogleContinue entry="/sign-up" />
      <form className="auth-form" onSubmit={submit} aria-busy={loading}>
        <RegistrationFields errors={errors} />
        <Field name="email" label="Email address" type="email" autoComplete="email" maxLength={190} error={errors.email} required />
        <Field name="password" label="Password" type="password" autoComplete="new-password" hint={passwordHint} minLength={8} maxLength={128} error={errors.password} required />
        <RegistrationLegal />
        {requestError && <p className="field-error" role="alert">{requestError}</p>}
        <button type="submit" className="action submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
      </form>
      <p>Already have an account? <Link className="inline-link" href={authHref("/login", router.query.next)}>Log in</Link></p>
    </AuthShell>
  );
}
