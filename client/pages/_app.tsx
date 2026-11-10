import "../styles/globals.css";
import "@mantine/core/styles.layer.css";
import "@mantine/notifications/styles.layer.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useState } from "react";
import { config } from "@fortawesome/fontawesome-svg-core";
import { createTheme, MantineProvider, useMantineColorScheme } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { ApolloProvider } from "@apollo/client/react";
import { createApolloClient } from "../lib/apollo";
import { GlobalUIProvider } from "../context/GlobalUI.context";

config.autoAddCss = false;

const theme = createTheme({
  primaryColor: "orange",
  colors: {
    dark: ["#FFFFFF", "#acaebf", "#8c8fa3", "#666980", "#4d4f66", "#34354a",
      "#2b2c3d", "#1d1e30", "#0c0d21", "#01010a"],
  },
});

function ColorSchemeShortcut() {
  const { toggleColorScheme } = useMantineColorScheme();
  useHotkeys([["mod+J", () => toggleColorScheme()]]);
  return null;
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const [apollo] = useState(() => createApolloClient(pageProps.apolloState, typeof window === "undefined"));

  return (
    <ApolloProvider client={apollo}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ColorSchemeShortcut />
        <Notifications />
        <GlobalUIProvider>
          <Component {...pageProps} />
          <footer className="mx-auto mt-12 flex max-w-[90rem] flex-wrap gap-4 border-t border-gray-300 px-4 py-5 text-sm sm:px-8">
            <Link className="underline" href="/privacy">Privacy policy</Link>
            <Link className="underline" href="/terms">Terms of service</Link>
          </footer>
        </GlobalUIProvider>
      </MantineProvider>
    </ApolloProvider>
  );
}
