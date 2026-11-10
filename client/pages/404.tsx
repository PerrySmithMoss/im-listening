import Link from "next/link";
import { Meta } from "../components/Home/Meta";
import { Navbar } from "../components/Navbar/Navbar";
import { feedHref } from "../lib/genres";

export default function NotFound() {
  return (
    <>
      <Meta title="Page not found | I'm Listening" description="Find your way back to the latest songs people have shared." />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="page-width detail">
        <div className="feed-state">
          <h1 className="page-title">We couldn’t find that page</h1>
          <p>Find your next favourite in the latest shares.</p>
          <Link href={feedHref()} className="action">Browse latest shares</Link>
        </div>
      </main>
    </>
  );
}
