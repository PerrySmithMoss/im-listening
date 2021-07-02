import { Navbar } from "../stories/components/Navbar/Navbar";
import { Header } from "../stories/components/Home/Header";
import { FeaturedArtists } from "../stories/components/Home/FeaturedArtists";
import { Categories } from "../stories/components/Home/Categories";
import { ListOfUserPosts } from "../stories/components/Home/ListOfUserPosts";
import { Meta } from "../stories/components/Home/Meta";
import { withApollo } from "../lib/withApollo";
import { useGetRecentPostsQuery } from "../graphql/generated/graphql";
import styles from "../stories/components/Home/user-posts.module.css";

const Home = () => {
  const { data, error, loading, fetchMore, variables } = useGetRecentPostsQuery(
    {
      variables: {
        limit: 2,
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

  const handleFetchMorePosts = async () => {
    await fetchMore({
      variables: {
        limit: variables?.limit,
        cursor:
          data?.getRecentPosts.posts[data.getRecentPosts.posts.length - 1]
            .createdAt,
      },
    });
  };

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
      <FeaturedArtists />
      <Categories />
      {!data && loading ? (
        <div>Loading...</div>
      ) : (
        <ListOfUserPosts recentPosts={data} />
      )}
      {data && data.getRecentPosts.hasMore ? (
        <div className={`${styles.seeMoreWrapper}`}>
          <button
            onClick={() => handleFetchMorePosts()}
            className={`${styles.seeMoreBtn}`}
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default withApollo({ ssr: true })(Home);
