import { Navbar } from "../stories/components/Navbar/Navbar";
import { Header } from "../stories/components/Home/Header";
import { FeaturedArtists } from "../stories/components/Home/FeaturedArtists";
import { Categories } from "../stories/components/Home/Categories";
import { ListOfUserPosts } from "../stories/components/Home/ListOfUserPosts";
import { Meta } from "../stories/components/Home/Meta";
import { withApollo } from "../lib/withApollo";
import { useGetRecentPostsQuery } from "../graphql/generated/graphql";

const Home = () => {
  const { data, loading } = useGetRecentPostsQuery();

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
      {!data ? <div>Loading...</div> : <ListOfUserPosts recentPosts={data} />}
    </div>
  );
};

export default withApollo({ ssr: true })(Home);
