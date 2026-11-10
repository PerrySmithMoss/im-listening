import { useState } from "react";
import { Skeleton } from "@mantine/core";
import { skipToken, useQuery } from "@apollo/client/react";
import { FilterPostsDocument, GetRecentPostsDocument } from "../../../graphql/generated/graphql";
import { ShareButton } from "../../Modal/ShareButton";
import { UserPostsCard } from "./UserPostsCard";
import { genres } from "../../../lib/genres";

const pageSize = 6;

export function ListOfUserPosts({ selected, clear }: { selected: string[]; clear: () => void }) {
  const [pageError, setPageError] = useState("");
  const [paging, setPaging] = useState(false);
  const filtered = selected.length > 0;
  const recent = useQuery(GetRecentPostsDocument, filtered ? skipToken : { variables: { limit: pageSize } });
  const filteredPosts = useQuery(FilterPostsDocument, filtered
    ? { variables: { limit: pageSize, genres: selected } }
    : skipToken);
  const { error, loading, refetch } = filtered ? filteredPosts : recent;
  const result = filtered ? filteredPosts.data?.filterPosts : recent.data?.getRecentPosts;
  const lastPost = result?.posts.at(-1);
  const names = genres.filter(({ value }) => selected.includes(value)).map(({ label }) => label);

  async function fetchMore() {
    if (!lastPost || paging) return;
    setPageError("");
    setPaging(true);
    const variables = { limit: pageSize, cursor: lastPost.createdAt, cursorId: Number(lastPost.id) };
    try {
      if (filtered) await filteredPosts.fetchMore({ variables: { ...variables, genres: selected } });
      else await recent.fetchMore({ variables });
    } catch {
      setPageError("Could not load more shares. The songs above are still available.");
    } finally {
      setPaging(false);
    }
  }

  return (
    <>
      <div className="actions mb-3">
        <p role="status" className="muted text-sm">
          {loading && !result ? "Loading shares…" :
            error ? "" :
            `${filtered ? names.join(", ") : "All genres"} · ${result?.posts.length ?? 0} ${result?.posts.length === 1 ? "share" : "shares"} shown`}
        </p>
        {filtered && (loading || error || Boolean(result?.posts.length)) && <button type="button" className="action action--secondary" onClick={clear}>Clear filters</button>}
      </div>
      {error && !paging && (
        <div className="feed-state mb-3">
          <p role="alert">Could not load shares. Check your connection and try again.</p>
          <button className="action action--secondary" type="button" onClick={() => void refetch().catch(() => undefined)}>Try again</button>
        </div>
      )}
      {loading && !result && (
        <div className="feed-grid" aria-hidden="true">
          {[0, 1].map((index) => <Skeleton key={index} height={148} radius="lg" />)}
        </div>
      )}
      {!loading && !error && !result?.posts.length && (
        <div className="feed-state">
          <p role="status">{filtered ? "No songs in these genres yet. Try another genre or clear the filters." : "Be the first to share a song."}</p>
          {filtered ? <button className="action action--secondary" type="button" onClick={clear}>Clear filters</button> :
            <ShareButton>Share the first song</ShareButton>}
        </div>
      )}
      {Boolean(result?.posts.length) && (
        <div className="feed-grid">
          {result?.posts.map((post) => <UserPostsCard key={post.id} post={post} selectedGenres={selected} />)}
        </div>
      )}
      {result?.hasMore && (
        <div className="feed-more">
          {pageError && <p role="alert" className="field-error mb-2">{pageError}</p>}
          <button type="button" disabled={paging || loading} className="action action--secondary" onClick={() => void fetchMore()}>
            {paging ? "Loading more…" : pageError ? "Retry loading more" : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
