import "../styles/globals.css";
// import "../stories/components/Old/button.css";
// import "../stories/components/Navbar/navbar.css";
import type { AppProps } from "next/app";
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useHotkeys, useLocalStorageValue } from "@mantine/hooks";
import { Layout } from "../stories/components/Layout/Layout";
import { withApollo } from "../lib/withApollo";
import { GlobalUIProvider } from "../context/GlobalUI.context";
import { NotificationsProvider } from "@mantine/notifications";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

function MyApp({ Component, pageProps }: AppProps) {
  const [colorScheme, setColorScheme] = useLocalStorageValue<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "light",
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      {/* <MantineProvider theme={{ colorScheme }} withGlobalStyles> */}
      <MantineProvider
        theme={{
          colorScheme: colorScheme,
          colors: {
            dark: [
              "#FFFFFF",
              "#acaebf",
              "#8c8fa3",
              "#666980",
              "#4d4f66",
              "#34354a",
              "#2b2c3d",
              "#1d1e30",
              "#0c0d21",
              "#01010a",
            ],
          },
        }}
        withGlobalStyles
      >
         <NotificationsProvider>
        <GlobalUIProvider>
          {/* <Layout> */}
          <Component {...pageProps} />
          {/* </Layout> */}
        </GlobalUIProvider>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
export default MyApp;
