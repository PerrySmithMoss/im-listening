import React from "react";
import { withApollo } from "../lib/withApollo";
import { Meta } from "../components/Home/Meta";
import { Navbar } from "../components/Navbar/Navbar";
import { SignUp } from "../components/SignUp/SignUp";
interface SignUpProps {}

const Sign_Up: React.FC<SignUpProps> = ({}) => {
  return (
    <>
      {/* <Navbar
        primary={true}
        onLogin={() => {}}
        onLogout={() => {}}
        onCreateAccount={() => {}}
      /> */}
         <Meta
        title={"Sign up | I'm Listening"}
        keywords={"music, social media, social, share music, music, register, signup"}
        description={"Share what you're listening to. Sign up now."}
      />
          <Navbar
        primary={true}
        onLogin={() => {}}
        onLogout={() => {}}
        onCreateAccount={() => {}}
        songAudio={false}
      />
      <SignUp />
    </>
  );
};

export default withApollo({ ssr: false })(Sign_Up);
