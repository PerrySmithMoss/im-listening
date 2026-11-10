import { Meta } from "../components/Home/Meta";
import { Navbar } from "../components/Navbar/Navbar";
import { SignUp } from "../components/SignUp/SignUp";

export default function SignUpPage() {
  return (
    <>
      <Meta title="Create an account | I'm Listening" description="Join the community and share the songs you love." />
      <Navbar />
      <SignUp />
    </>
  );
}
