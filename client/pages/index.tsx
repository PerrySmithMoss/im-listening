import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Navbar } from "../components/Navbar/Navbar";
import { Header } from "../components/Home/Header";
import { Categories, genreInputId } from "../components/Home/Categories";
import { ListOfUserPosts } from "../components/Home/UserPosts/ListOfUserPosts";
import { Meta } from "../components/Home/Meta";
import { useShare } from "../context/Share.context";
import { FilterPostsDocument, GetCurrentUserDocument, GetRecentPostsDocument } from "../graphql/generated/graphql";
import { createApolloClient } from "../lib/apollo";
import { feedHref, parseGenres } from "../lib/genres";

export const getServerSideProps: GetServerSideProps = async ({ query, req, res }) => {
  const apollo = createApolloClient(undefined, true);
  const selected = parseGenres(query.genre);
  const sessionCookie = req.headers.cookie?.split(/;\s*/).find((cookie) =>
    cookie.startsWith("__Host-im-listening=") || cookie.startsWith("im-listening="));

  const feed = selected.length
    ? apollo.query({ query: FilterPostsDocument, variables: { limit: 6, genres: selected } })
    : apollo.query({ query: GetRecentPostsDocument, variables: { limit: 6 } });

  if (sessionCookie) {
    res.setHeader("Cache-Control", "private, no-store");
    const protocol = req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const session = apollo.query({
      query: GetCurrentUserDocument,
      context: {
        headers: { cookie: sessionCookie, origin: `${protocol}://${req.headers.host}` },
        fetchOptions: { redirect: "error" },
      },
    });
    // The feed and session are independent; the browser can retry either if it fails.
    await Promise.allSettled([feed, session]);
  } else {
    apollo.writeQuery({ query: GetCurrentUserDocument, data: { getCurrentUser: null } });
    await Promise.allSettled([feed]);
  }
  return { props: { apolloState: apollo.extract() } };
};

export default function Home() {
  const { signedIn, loading } = useShare();
  const router = useRouter();
  const selected = parseGenres(router.query.genre);

  function setGenres(values: string[]) {
    void router.push(feedHref(parseGenres(values), false), undefined, { shallow: true, scroll: false });
  }

  return (
    <>
      <Meta title="I'm Listening" description="Share a song you love, say why, and find your next favourite." />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="page-width">
        <Header signedIn={signedIn} loading={loading} />
        <section id="latest-shares" tabIndex={-1} className="feed" aria-labelledby="latest-shares-heading">
          <h2 id="latest-shares-heading" className="section-title">Latest shares</h2>
          <Categories selected={selected} onChange={setGenres} />
          <ListOfUserPosts key={selected.join(",")} selected={selected} clear={() => { setGenres([]); document.getElementById(genreInputId)?.focus(); }} />
        </section>
      </main>
    </>
  );
}
