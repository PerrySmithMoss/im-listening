import Head from "next/head";
import { GoogleOnboarding } from "../components/GoogleAuth/GoogleAuth";
import { Navbar } from "../components/Navbar/Navbar";

export default function GoogleOnboardingPage() {
  return (
    <>
      <Head><title>Finish creating your account | I&apos;m Listening</title></Head>
      <Navbar />
      <GoogleOnboarding />
    </>
  );
}
