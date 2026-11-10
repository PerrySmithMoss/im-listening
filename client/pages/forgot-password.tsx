import { useMutation } from "@apollo/client/react";
import { useState, type FormEvent } from "react";
import signupStyles from "../components/SignUp/signup.module.css";
import { ForgotPasswordDocument } from "../graphql/generated/graphql";
import { Meta } from "../components/Home/Meta";
import { Navbar } from "../components/Navbar/Navbar";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const [forgotPassword, { loading }] = useMutation(ForgotPasswordDocument);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setComplete(false);
    try {
      await forgotPassword({ variables: { email } });
      setComplete(true);
    } catch {
      setError("Could not request a reset link. Please try again later.");
    }
  }

  return (
    <>
      <Meta title="Forgot password | I'm Listening" keywords="music" description="Request a password reset link." />
      <Navbar />
      <section className={signupStyles.signupContainer}>
        <div className={`${signupStyles.heroImageContainer} hidden llg:block`}>
          <img className={signupStyles.smartphoneHeroImage} src="/assets/register-hero_image.svg" alt="" />
        </div>
        <div className="px-4 sm:px-8">
          <h1 className="text-4xl xss:text-5xl md:text-6xl font-bold">Forgot password</h1>
          <form onSubmit={submit}>
            <label htmlFor="email" className="block mt-3">Enter your email address</label>
            <input className={`${signupStyles.formInput} text-black`} type="email" id="email" name="email" autoComplete="email" required
              value={email} onChange={(event) => setEmail(event.currentTarget.value)} />
            {complete && <p className={signupStyles.signupSuccess} role="status">If an account exists for that address, we&apos;ll send a reset link.</p>}
            {error && <p className={signupStyles.sigupErrors} role="alert">{error}</p>}
            <button type="submit" disabled={loading} className="mt-5 bg-brand-orange hover:bg-brand-orange_hover w-full py-3 rounded text-white">Send reset link</button>
          </form>
        </div>
      </section>
    </>
  );
}
