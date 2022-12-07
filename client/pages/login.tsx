import React from "react";
import { Meta } from "../components/Home/Meta";
import { Navbar } from "../components/Navbar/Navbar";
import { Login } from "../components/Login/Login";
import { withApollo } from "../lib/withApollo";
interface SignUpProps {}

const Log_In: React.FC<SignUpProps> = ({}) => {
  return (
    <>
      <Meta
        title={"Log in | I'm Listening"}
        keywords={
          "music, social media, social, share music, music, register, signup"
        }
        description={"Share what you're listening to. Log in now."}
      />
      <Navbar
        primary={true}
        onLogin={() => {}}
        onLogout={() => {}}
        onCreateAccount={() => {}}
        songAudio={false}
      />
      <Login />
    </>
  );
};

export default withApollo({ ssr: false })(Log_In);
