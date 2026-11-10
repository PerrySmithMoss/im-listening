import { useQuery } from "@apollo/client/react";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Navbar } from "../components/Navbar/Navbar";
import { Header } from "../components/Home/Header";
import { Categories, genreInputId } from "../components/Home/Categories";
import { ListOfUserPosts } from "../components/Home/UserPosts/ListOfUserPosts";
import { Meta } from "../components/Home/Meta";
import { FilterPostsDocument, GetCurrentUserDocument, GetRecentPostsDocument } from "../graphql/generated/graphql";
import { createApolloClient } from "../lib/apollo";
import { feedHref, parseGenres } from "../lib/genres";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const apollo = createApolloClient(undefined, true);
  const selected = parseGenres(query.genre);
  try {
    if (selected.length) await apollo.query({ query: FilterPostsDocument, variables: { limit: 6, genres: selected } });
    else await apollo.query({ query: GetRecentPostsDocument, variables: { limit: 6 } });
    return { props: { apolloState: apollo.extract() } };
  } catch {
    // The browser can retry a transient API error.
    return { props: {} };
  }
};

export default function Home() {
  const { data } = useQuery(GetCurrentUserDocument, { ssr: false });
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
        <Header signedIn={Boolean(data?.getCurrentUser)} />
        <section id="latest-shares" tabIndex={-1} className="feed" aria-labelledby="latest-shares-heading">
          <h2 id="latest-shares-heading" className="section-title">Latest shares</h2>
          <Categories selected={selected} onChange={setGenres} />
          <ListOfUserPosts key={selected.join(",")} selected={selected} clear={() => { setGenres([]); document.getElementById(genreInputId)?.focus(); }} />
        </section>
      </main>
    </>
  );
}
