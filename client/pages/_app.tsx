import '../styles/globals.css'
// import "../stories/components/Old/button.css";
// import "../stories/components/Navbar/navbar.css";

import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp
