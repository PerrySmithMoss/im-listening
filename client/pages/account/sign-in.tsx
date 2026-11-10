import Head from "next/head";
import { SignInSettings } from "../../components/GoogleAuth/GoogleAuth";
import { Navbar } from "../../components/Navbar/Navbar";

export default function SignInSettingsPage() {
  return (
    <>
      <Head><title>Sign-in methods | I&apos;m Listening</title></Head>
      <Navbar />
      <SignInSettings />
    </>
  );
}
