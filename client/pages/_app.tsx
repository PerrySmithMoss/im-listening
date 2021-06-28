import "../styles/globals.css";
// import "../stories/components/Old/button.css";
// import "../stories/components/Navbar/navbar.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from "@apollo/client";
import type { AppProps } from "next/app";

// const client = new ApolloClient({
//   uri: process.env.GRAPHQL_API_URL,
//   credentials: "include",
//   cache: new InMemoryCache(),
//   connectToDevTools: true,
//   ssrMode: typeof window === "undefined"
// });

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <Component {...pageProps} />
  );
}
export default MyApp;
