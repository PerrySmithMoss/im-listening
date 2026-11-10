import { useApolloClient, useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type FormEvent } from "react";
import { Meta } from "../../components/Home/Meta";
import { Navbar } from "../../components/Navbar/Navbar";
import signupStyles from "../../components/SignUp/signup.module.css";
import { ChangePasswordDocument } from "../../graphql/generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";

export default function ChangePassword() {
  const router = useRouter();
  const apollo = useApolloClient();
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [changePassword, { loading }] = useMutation(ChangePasswordDocument);
  const token = typeof router.query.token === "string" ? router.query.token : "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    try {
      const { data } = await changePassword({ variables: { token, password } });
      if (data?.changePassword.errors?.length) {
        setErrors(toErrorMap(data.changePassword.errors));
      } else if (data?.changePassword.user) {
        await apollo.resetStore();
        void router.replace("/");
      }
    } catch {
      setErrors({ password: "Could not reset your password. Please try again." });
    }
  }

  return (
    <>
      <Meta title="Reset password | I'm Listening" keywords="music" description="Set a new password." />
      <Navbar />
      <section className={signupStyles.signupContainer}>
        <div className={`${signupStyles.heroImageContainer} hidden llg:block`}>
          <img className={signupStyles.smartphoneHeroImage} src="/assets/register-hero_image.svg" alt="" />
        </div>
        <div className="px-4 sm:px-8">
          <h1 className="text-4xl xss:text-5xl md:text-6xl font-bold">Reset password</h1>
          <form onSubmit={submit}>
            <label htmlFor="password" className="block mt-3">New password</label>
            <input className={`${signupStyles.formInput} text-black`} type="password" id="password" autoComplete="new-password"
              required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.currentTarget.value)} />
            {errors.password && <p role="alert" className={signupStyles.sigupErrors}>{errors.password}</p>}
            {errors.token && (
              <>
                <p role="alert" className={signupStyles.sigupErrors}>{errors.token}</p>
                <Link href="/forgot-password" className={signupStyles.forgotPassword}>Request a new link</Link>
              </>
            )}
            <button type="submit" disabled={loading || !token} className="mt-5 bg-brand-orange hover:bg-brand-orange_hover w-full py-3 rounded text-white">Change password</button>
          </form>
        </div>
      </section>
    </>
  );
}
