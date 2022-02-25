import "../styles/globals.css";
// import "../stories/components/Old/button.css";
// import "../stories/components/Navbar/navbar.css";
import type { AppProps } from "next/app";
import "@fortawesome/fontawesome-svg-core/styles.css"; // import Font Awesome CSS
import { config } from "@fortawesome/fontawesome-svg-core";
import { useState } from "react";
import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

function MyApp({ Component, pageProps }: AppProps) {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");
  const toggleColorScheme = (value?: "light" | "dark") =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider theme={{ colorScheme }} withGlobalStyles>
          <Component {...pageProps} />
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
export default MyApp;
