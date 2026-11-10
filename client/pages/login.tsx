import { Meta } from "../components/Home/Meta";
import { Navbar } from "../components/Navbar/Navbar";
import { Login } from "../components/Login/Login";

export default function LoginPage() {
  return (
    <>
      <Meta title="Log in | I'm Listening" description="Log in to share the songs you love." />
      <Navbar />
      <Login />
    </>
  );
}
