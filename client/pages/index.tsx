import { Navbar } from "../stories/components/Navbar/Navbar";
import { Header } from "../stories/components/Home/Header";
import { FeaturedArtists } from "../stories/components/Home/FeaturedArtists";
import { Categories } from "../stories/components/Home/Categories";
import { ListOfUserPosts } from "../stories/components/Home/ListOfUserPosts";
import { GetServerSideProps } from "next";
import { Meta } from "../stories/components/Home/Meta";

export default function Home({ data }: any) {
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
      <ListOfUserPosts data={data} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`http://localhost:5000/`);
  const data = await res.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: { data }, // will be passed to the page component as props
  };
};
