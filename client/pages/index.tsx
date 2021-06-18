import { Navbar } from "../stories/components/Navbar/Navbar";
import { Header } from "../stories/components/Home/Header";
import { FeaturedArtists } from "../stories/components/Home/FeaturedArtists";
import { Categories } from "../stories/components/Home/Categories";
import { ListOfUserPosts } from "../stories/components/Home/ListOfUserPosts";

export default function Home() {
  return (
    // <div>
    //   <header>
    //     <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
    //     <h3>I'm Listening</h3>
    //     <ul>
    //       <li>
    //         <a href="#">Home</a>
    //       </li>
    //       <li>
    //         <a href="#">Latest</a>
    //       </li>
    //       <li>
    //         <a href="#">Popular</a>
    //       </li>
    //     </ul>
    //     <ul>
    //       <li>
    //         <a href="#">Login</a>
    //       </li>
    //       <li>
    //         <a href="#">Sign up</a>
    //       </li>
    //     </ul>
    //   </header>
    // </div>
    <div>
      <Navbar
        primary={true}
        onLogin={() => {}}
        onLogout={() => {}}
        onCreateAccount={() => {}}
      />
      <Header />
      <FeaturedArtists />
      <Categories />
      <ListOfUserPosts />
    </div>
    // <div>
    //   <Image src="/assets/headphones.svg" height={60} width={60}/>
    // </div>
  );
}
