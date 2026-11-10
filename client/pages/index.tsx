import { useQuery } from "@apollo/client/react";
import type { GetServerSideProps } from "next";
import { Navbar } from "../components/Navbar/Navbar";
import { Header } from "../components/Home/Header";
import { WeeklyMostPopular } from "../components/Home/WeeklyMostPopular/WeeklyMostPopular";
import { Categories } from "../components/Home/Categories";
import { ListOfUserPosts } from "../components/Home/UserPosts/ListOfUserPosts";
import { Meta } from "../components/Home/Meta";
import { PromotedArtists } from "../components/Home/PromotedArtists/PromotedArtists";
import { DiscoverNewMusic } from "../components/Home/DiscoverNewMusic/DiscoverNewMusic";
import { GetCurrentUserDocument, GetRecentPostsDocument } from "../graphql/generated/graphql";
import { createApolloClient } from "../lib/apollo";

export const getServerSideProps: GetServerSideProps = async () => {
  const apollo = createApolloClient(undefined, true);
  try {
    await apollo.query({ query: GetRecentPostsDocument, variables: { limit: 6 } });
    return { props: { apolloState: apollo.extract() } };
  } catch {
    // The page can still render while the API is starting.
    return { props: {} };
  }
};

export default function Home() {
  const { data } = useQuery(GetCurrentUserDocument, { ssr: false });

  return (
    <div className="max-w-[90rem] mx-auto">
      <Meta title="I'm Listening" keywords="music, social media, share music" description="Share what you're listening to." />
      <Navbar />
      {!data?.getCurrentUser && <Header />}
      <Categories />
      <ListOfUserPosts />
      {!data?.getCurrentUser && (
        <>
          <DiscoverNewMusic />
          <WeeklyMostPopular />
          <PromotedArtists />
        </>
      )}
    </div>
  );
}
