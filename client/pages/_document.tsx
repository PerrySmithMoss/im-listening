import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { Head, Html, Main, NextScript } from "next/document";

// A deployment can retire the scripts referenced by HTML that is already in a browser.
// Register before Next's scripts so recovery also works when React never starts.
const recoverMissingNextScript = `
  window.addEventListener("error", (event) => {
    const script = event.target;
    if (!(script instanceof HTMLScriptElement) || document.readyState === "complete") return;

    const url = new URL(script.src, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith("/_next/static/") ||
        !url.pathname.endsWith(".js")) return;

    const key = "im-listening:asset-reload";
    try {
      const now = Date.now();
      if (now - Number(sessionStorage.getItem(key)) < 30_000) return;
      sessionStorage.setItem(key, String(now));
    } catch {
      return;
    }
    location.reload();
  }, true);
`;

export default function Document() {
  return (
    <Html lang="en" {...mantineHtmlProps}>
      <Head>
        <script id="recover-missing-next-script" dangerouslySetInnerHTML={{ __html: recoverMissingNextScript }} />
        <ColorSchemeScript defaultColorScheme="light" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
