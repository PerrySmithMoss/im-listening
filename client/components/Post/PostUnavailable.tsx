import Link from "next/link";
import { feedHref } from "../../lib/genres";

export function PostUnavailable({ retry, selected = [] }: { retry?: () => void; selected?: string[] }) {
  return (
    <main id="main-content" tabIndex={-1} className="page-width detail">
      <div className="feed-state">
        <h1 className="page-title">{retry ? "Couldn’t load this post" : "This post isn’t available"}</h1>
        <p>{retry ? "There was a problem loading the share. Try again or return to the feed." : "The link may be out of date, or the post may have been removed."}</p>
        <div className="actions">
          {retry && <button type="button" className="action" onClick={retry}>Try again</button>}
          <Link href={feedHref(selected)} className={`action${retry ? " action--secondary" : ""}`}>Browse latest shares</Link>
        </div>
      </div>
    </main>
  );
}
