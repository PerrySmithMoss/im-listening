import React from "react";
import { Meta } from "../stories/components/Home/Meta";
import { Navbar } from "../stories/components/Navbar/Navbar";
import { Login } from "../stories/components/Login/Login";
interface SignUpProps {}

const Log_In: React.FC<SignUpProps> = ({}) => {
  return (
    <>
      {/* <Navbar
        primary={true}
        onLogin={() => {}}
        onLogout={() => {}}
        onCreateAccount={() => {}}
      /> */}
      <Meta
        title={"I'm Listening | Register"}
        keywords={
          "music, social media, social, share music, music, register, signup"
        }
        description={"Share what you're listening to. Register now."}
      />
      <Login />
    </>
  );
};

export default Log_In;
