import React from "react";
import { Navbar } from "../stories/components/Navbar/Navbar";
import { SignUp } from "../stories/components/SignUp/SignUp";
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
      <SignUp />
    </>
  );
};

export default Sign_Up;
