import { useState } from "react";
import { skipToken, useQuery } from "@apollo/client/react";
import { useGlobalUIContext } from "../../../context/GlobalUI.context";
import { FilterPostsDocument, GetRecentPostsDocument } from "../../../graphql/generated/graphql";
import styles from "./user-posts.module.css";
import { UserPostsCard } from "./UserPostsCard";

export function ListOfUserPosts() {
  const [pageError, setPageError] = useState("");
  const { filterCategories } = useGlobalUIContext();
  const filtered = filterCategories.length > 0;
  const recent = useQuery(GetRecentPostsDocument, filtered ? skipToken : { variables: { limit: 6 } });
  const filteredPosts = useQuery(FilterPostsDocument, filtered
    ? { variables: { limit: 6, genres: filterCategories } }
    : skipToken);
  const { error, loading } = filtered ? filteredPosts : recent;
  const result = filtered ? filteredPosts.data?.filterPosts : recent.data?.getRecentPosts;
  const lastPost = result?.posts.at(-1);

  function fetchMore() {
    if (!lastPost) return;
    setPageError("");
    const variables = { limit: 6, cursor: lastPost.createdAt, cursorId: Number(lastPost.id) };
    const request = filtered
      ? filteredPosts.fetchMore({ variables: { ...variables, genres: filterCategories } })
      : recent.fetchMore({ variables });
    void request.catch(() => setPageError("Could not load more posts. Please try again."));
  }

  return (
    <section className="mx-auto mt-2">
      <div className="grid grid-cols-1 largeTablet:grid-cols-2 gap-6 px-4 sm:px-8 lg:px-16 xl:px-20">
        {error && <p role="alert">Could not load posts. Please try again later.</p>}
        {loading && !result && <p role="status">Loading posts…</p>}
        {!loading && !error && !result?.posts.length && <p>{filtered ? "No posts match these genres yet." : "No posts yet."}</p>}
        {result?.posts.map((post) => <UserPostsCard key={post.id} post={post} />)}
      </div>
      {pageError && <p role="alert" className="text-center mt-3">{pageError}</p>}
      {result?.hasMore && (
        <div className={`${styles.seeMoreWrapper} mt-6`}>
          <button type="button" disabled={loading} className="px-8 py-2.5 bg-brand-orange hover:bg-brand-orange_hover text-white rounded" onClick={fetchMore}>
            Load more
          </button>
        </div>
      )}
    </section>
  );
}
