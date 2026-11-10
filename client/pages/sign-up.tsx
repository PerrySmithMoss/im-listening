import React from "react";
import { Meta } from "../components/Home/Meta";
import { Navbar } from "../components/Navbar/Navbar";
import { SignUp } from "../components/SignUp/SignUp";
interface SignUpProps {}

const Sign_Up: React.FC<SignUpProps> = ({}) => {
  return (
    <>
      <Meta
        title={"Sign up | I'm Listening"}
        keywords={
          "music, social media, social, share music, music, register, signup"
        }
        description={"Share what you're listening to. Sign up now."}
      />
      <Navbar />
      <SignUp />
    </>
  );
};

export default Sign_Up;
