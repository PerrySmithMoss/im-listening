import { Navbar } from "../stories/components/Navbar/Navbar";
import { Header } from "../stories/components/Home/Header";
import { WeeklyMostPopular } from "../stories/components/Home/WeeklyMostPopular/WeeklyMostPopular";
import { Categories } from "../stories/components/Home/Categories";
import { ListOfUserPosts } from "../stories/components/Home/UserPosts/ListOfUserPosts";
import { Meta } from "../stories/components/Home/Meta";
import { withApollo } from "../lib/withApollo";
import {
  useGetCurrentUserQuery,
  useGetRecentPostsQuery,
} from "../graphql/generated/graphql";
import styles from "../stories/components/Home/user-posts.module.css";
import { isServer } from "../utils/isServer";
import { PromotedArtists } from "../stories/components/Home/PromotedArtists/PromotedArtists";
import { DiscoverNewMusic } from "../stories/components/Home/DiscoverNewMusic/DiscoverNewMusic";

const Home = () => {
  const { data: user, loading: userLoading } = useGetCurrentUserQuery({
    skip: isServer(),
  });
  const { data, error, loading } = useGetRecentPostsQuery(
    {
      variables: {
        limit: 6,
        cursor: null,
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  if (!loading && !data) {
    return (
      <div>
        <div>Something went wrong while trying to fetch user posts...</div>
        <div>{error?.message}</div>
      </div>
    );
  }
  return (
    <div>
      <Meta
        title={"I'm Listening"}
        keywords={"music, social media, social, share music, music"}
        description={"Share what you're listening to."}
      />
      <Navbar
        primary={true}
        onLogin={() => {}}
        onLogout={() => {}}
        onCreateAccount={() => {}}
      />
      <Header />
      <DiscoverNewMusic />
      <WeeklyMostPopular />
      {!user?.getCurrentUser ? (
        <PromotedArtists />
      ) : !data && loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Categories />
          <ListOfUserPosts recentPosts={data} />
        </>
      )}
    </div>
  );
};

export default withApollo({ ssr: true })(Home);
