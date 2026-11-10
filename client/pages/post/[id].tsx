import { useMutation, useQuery } from "@apollo/client/react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { Meta } from "../../components/Home/Meta";
import styles from "../../components/Home/UserPosts/user-posts.module.css";
import { Navbar } from "../../components/Navbar/Navbar";
import { PostRating } from "../../components/Rating/Rating";
import { DeletePostDocument, GetCurrentUserDocument, GetPostDocument } from "../../graphql/generated/graphql";
import { createApolloClient } from "../../lib/apollo";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = Number(params?.id);
  if (!Number.isInteger(id) || id < 1 || id > 2147483647) return { notFound: true };
  const apollo = createApolloClient(undefined, true);
  try {
    const { data } = await apollo.query({ query: GetPostDocument, variables: { id } });
    if (!data?.getPost) return { notFound: true };
    return { props: { id, apolloState: apollo.extract() } };
  } catch {
    return { props: { id } };
  }
};

export default function Post({ id }: { id: number }) {
  const router = useRouter();
  const { data, loading, error } = useQuery(GetPostDocument, { variables: { id } });
  const { data: account } = useQuery(GetCurrentUserDocument, { ssr: false });
  const [deletePost, { loading: deleting }] = useMutation(DeletePostDocument);
  const [deleteError, setDeleteError] = useState("");
  const post = data?.getPost;

  async function removePost() {
    setDeleteError("");
    try {
      const response = await deletePost({
        variables: { id },
        update(cache, { data }) {
          if (!data?.deletePost) return;
          cache.evict({ id: cache.identify({ __typename: "Post", id: String(id) }) });
          cache.evict({ fieldName: "getRecentPosts" });
          cache.evict({ fieldName: "filterPosts" });
        },
      });
      if (!response.data?.deletePost) throw new Error();
      void router.push("/");
    } catch {
      setDeleteError("Could not delete this post. Please try again.");
    }
  }

  return (
    <>
      <Meta title={post ? `${post.title} | I'm Listening` : "Post | I'm Listening"} keywords="music, share music" description="Share what you're listening to." />
      <Navbar />
      {loading && <p role="status">Loading…</p>}
      {error && <p role="alert">Could not load this post. Please try again later.</p>}
      {!loading && !error && !post && <p>Post not found.</p>}
      {post && (
        <section className={`${styles.individualPostWrapper} px-4 sm:px-8`}>
          <article className={styles.individualPostItem}>
            <img className={styles.albumImage} src={post.albumImage || "/assets/image-placeholder.png"} alt="Album cover art" />
            <div className={styles.individualUserReview}>
              <div className={styles.userHeader}>
                <img className={styles.userAvatarImage} src={post.author.profile?.avatar || "/assets/user-avatar.jpeg"} alt="" />
                <div className={styles.userHandles}>
                  <p className="font-bold">{post.author.firstName} {post.author.lastName}</p>
                  <span className="text-[#0f8deb] text-sm">{post.author.username}</span>
                </div>
              </div>
              <p className="font-bold pt-3 pb-1">{post.artistName} · {post.albumName}</p>
              <h1 className={`${styles.userUsername} ${styles.withPadding}`}>{post.title}</h1>
              <PostRating value={post.rating} />
              {post.previewSongUrl && <audio controls src={post.previewSongUrl} aria-label="Song preview" />}
              {account?.getCurrentUser?.id === post.author.id && (
                <button type="button" aria-label="Delete post" disabled={deleting} onClick={removePost} className={styles.iconBadgeWrapper}>
                  <FontAwesomeIcon color="red" icon={faTrash} className={styles.iconBadgeDelete} />
                </button>
              )}
              {deleteError && <p role="alert">{deleteError}</p>}
            </div>
          </article>
        </section>
      )}
    </>
  );
}
