import "../styles/globals.css";
import "@mantine/core/styles.layer.css";
import "@mantine/notifications/styles.layer.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useState } from "react";
import { createTheme, MantineProvider, useMantineColorScheme, type CSSVariablesResolver } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { ApolloProvider } from "@apollo/client/react";
import { createApolloClient } from "../lib/apollo";
import { ShareProvider } from "../context/Share.context";

const theme = createTheme({
  primaryColor: "warm",
  primaryShade: { light: 8, dark: 8 },
  colors: {
    warm: ["#fff4e9", "#ffe6d3", "#ffd0aa", "#ffb581", "#fd9958", "#fd7e14",
      "#e06311", "#c54d0d", "#a43d0e", "#84310c"],
  },
  fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  defaultRadius: "md",
});

const cssVariables: CSSVariablesResolver = () => {
  const semantic = {
    "--mantine-color-body": "var(--page)",
    "--mantine-color-text": "var(--ink)",
    "--mantine-color-dimmed": "var(--muted)",
    "--mantine-color-placeholder": "var(--muted)",
    "--mantine-color-error": "var(--danger)",
    "--mantine-primary-color-filled-hover": "var(--action-hover)",
  };
  return { variables: {}, light: semantic, dark: semantic };
};

function ColorSchemeShortcut() {
  const { toggleColorScheme } = useMantineColorScheme();
  useHotkeys([["mod+J", () => toggleColorScheme()]]);
  return null;
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const [apollo] = useState(() => createApolloClient(pageProps.apolloState, typeof window === "undefined"));

  return (
    <ApolloProvider client={apollo}>
      <MantineProvider theme={theme} cssVariablesResolver={cssVariables} defaultColorScheme="light">
        <ColorSchemeShortcut />
        <Notifications position="top-center" />
        <ShareProvider>
          <a className="action skip-link" href="#main-content">Skip to content</a>
          <Component {...pageProps} />
          <footer className="page-width site-footer">
            <Link className="inline-link" href="/privacy">Privacy policy</Link>
            <Link className="inline-link" href="/terms">Terms of service</Link>
          </footer>
        </ShareProvider>
      </MantineProvider>
    </ApolloProvider>
  );
}
