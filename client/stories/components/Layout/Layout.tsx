import { ColorScheme } from "@mantine/core";
import { useLocalStorageValue } from "@mantine/hooks";
import Head from "next/head";
import React from "react";
import { Navbar } from "../Navbar/Navbar";

interface LayoutProps {}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col ">
        <div className={`sticky top-0 left-0 z-50 w-full`}>
          <Navbar
            primary={true}
            onLogin={() => {}}
            onLogout={() => {}}
            onCreateAccount={() => {}}
          />
        </div>
        <div className="text-black-thunder font-heebo z-40">{children}</div>
      </div>
    </>
  );
};
