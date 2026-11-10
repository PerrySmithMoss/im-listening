import Link from "next/link";
import type { GetRecentPostsQuery } from "../../../graphql/generated/graphql";
import { postHref } from "../../../lib/genres";
import { Artwork } from "../../Post/PostMedia";
import { PostByline } from "../../Post/PostByline";
import { PostRating } from "../../Rating/Rating";

export function UserPostsCard({ post, selectedGenres }: {
  post: GetRecentPostsQuery["getRecentPosts"]["posts"][number];
  selectedGenres: string[];
}) {
  return (
    <article className="post-card">
      <Artwork src={post.albumImage} sizes="(max-width: 620px) 18vw, 112px" />
      <div className="post-copy wrap-anywhere">
        <div>
          <h3><Link className="inline-link" href={postHref(post.id, selectedGenres)}>{post.albumName}</Link></h3>
          <p className="muted">{post.artistName}</p>
        </div>
        <PostByline author={post.author} createdAt={post.createdAt} />
        <p className="post-note">{post.title}</p>
        <PostRating value={post.rating} />
      </div>
    </article>
  );
}
