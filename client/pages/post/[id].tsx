import { useMutation, useQuery } from "@apollo/client/react";
import { Modal, Skeleton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { Meta } from "../../components/Home/Meta";
import { Navbar } from "../../components/Navbar/Navbar";
import { PostByline } from "../../components/Post/PostByline";
import { Artwork, isSpotifyArtwork, mediaUrl, socialArtwork } from "../../components/Post/PostMedia";
import { PostUnavailable } from "../../components/Post/PostUnavailable";
import { PostRating } from "../../components/Rating/Rating";
import { DeletePostDocument, GetCurrentUserDocument, GetPostDocument, type GetPostQuery } from "../../graphql/generated/graphql";
import { createApolloClient } from "../../lib/apollo";
import { feedHref, parseGenres } from "../../lib/genres";

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const slug = params?.id;
  const id = typeof slug === "string" && /^[1-9][0-9]{0,9}$/.test(slug) ? Number(slug) : 0;
  if (!id || id > 2147483647) {
    res.statusCode = 404;
    return { props: { id: null } };
  }
  const apollo = createApolloClient(undefined, true);
  try {
    const { data } = await apollo.query({ query: GetPostDocument, variables: { id } });
    if (!data?.getPost) {
      res.statusCode = 404;
      return { props: { id: null } };
    }
    return { props: { id, initialPost: data.getPost } };
  } catch {
    return { props: { id } };
  }
};

type PublicPost = NonNullable<GetPostQuery["getPost"]>;

export default function PostPage({ id, initialPost }: { id: number | null; initialPost?: PublicPost }) {
  const { query } = useRouter();
  return (
    <>
      <Navbar />
      {id === null ? <>
        <Meta title="Post not available | I'm Listening" description="Browse the latest songs people have shared." />
        <PostUnavailable selected={parseGenres(query.genre)} />
      </> : initialPost ? <PostDetail key={id} post={initialPost} /> : <PostLoader key={id} id={id} />}
    </>
  );
}

function PostLoader({ id }: { id: number }) {
  const { query } = useRouter();
  const { data, loading, error, refetch } = useQuery(GetPostDocument, { variables: { id } });
  const post = data?.getPost;
  if (post) return <PostDetail post={post} />;

  const selected = parseGenres(query.genre);
  return (
    <>
      <Meta title="Post | I'm Listening" description="A song shared by an I’m Listening member." />
      {loading ? (
        <main id="main-content" tabIndex={-1} className="page-width detail">
          <h1 className="page-title mb-3" role="status">Loading share…</h1>
          <Skeleton height={148} radius="lg" />
        </main>
      ) : <PostUnavailable selected={selected} retry={error ? () => void refetch().catch(() => undefined) : undefined} />}
    </>
  );
}

function PostDetail({ post }: { post: PublicPost }) {
  const router = useRouter();
  const selected = parseGenres(router.query.genre);
  const back = feedHref(selected);
  const { data: account } = useQuery(GetCurrentUserDocument, { ssr: false });
  const [deletePost, { loading: deleting }] = useMutation(DeletePostDocument);
  const [confirm, setConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [copyState, setCopyState] = useState("");
  const [manualLink, setManualLink] = useState("");
  const linkField = useRef<HTMLInputElement>(null);

  const artwork = mediaUrl(post.albumImage);
  const shareArtwork = artwork && isSpotifyArtwork(artwork) ? artwork : null;
  const preview = mediaUrl(post.previewSongUrl);
  const spotify = post.spotifyTrackId && /^[A-Za-z0-9]{22}$/.test(post.spotifyTrackId)
    ? `https://open.spotify.com/track/${post.spotifyTrackId}` : null;
  const path = `/post/${post.id}`;

  async function removePost() {
    setDeleteError("");
    try {
      const response = await deletePost({
        variables: { id: Number(post.id) },
        update(cache, { data }) {
          if (!data?.deletePost) return;
          cache.evict({ fieldName: "getRecentPosts" });
          cache.evict({ fieldName: "filterPosts" });
        },
      });
      if (!response.data?.deletePost) throw new Error();
    } catch {
      setDeleteError("Could not delete this post. Please try again.");
      return;
    }
    setConfirm(false);
    notifications.show({ message: <span role="status">Post deleted.</span>, color: "teal", withCloseButton: false });
    await router.replace(back).catch(() => {
      const params = new URLSearchParams(selected.map((value) => ["genre", value]));
      window.location.replace(`/${params.size ? `?${params}` : ""}#latest-shares`);
    });
  }

  async function copyLink() {
    const url = new URL(path, window.location.origin).href;
    setCopyState("");
    try {
      await navigator.clipboard.writeText(url);
      setManualLink("");
      setCopyState("Link copied.");
    } catch {
      setManualLink(url);
      setCopyState("Copy this link to share the post.");
      requestAnimationFrame(() => { linkField.current?.focus(); linkField.current?.select(); });
    }
  }

  return (
    <>
      <Meta title={`${post.albumName} by ${post.artistName} | I'm Listening`}
        description={`${post.author.firstName} shared ${post.albumName} by ${post.artistName}: ${post.title}`}
        share={{ path, image: shareArtwork ?? socialArtwork, imageAlt: shareArtwork ? `Artwork for ${post.albumName}` : "Music note on a record" }} />
      <main id="main-content" tabIndex={-1} className="page-width detail">
        <Link href={back} className="inline-link">← Back to latest shares</Link>
        <article className="detail-content">
          <Artwork src={artwork} alt={`Artwork for ${post.albumName}`} sizes="(max-width: 672px) 192px, 272px" eager />
          <div className="detail-copy wrap-anywhere">
            <header>
              <h1 className="page-title">{post.albumName}</h1>
              <p className="muted text-lg mt-1">{post.artistName}</p>
            </header>
            <PostByline author={post.author} createdAt={post.createdAt} />
            <p className="post-note">{post.title}</p>
            <PostRating value={post.rating} />
            <section className="auth-form mt-2">
              <h2 className="section-title">Listen</h2>
              {spotify ? (
                <iframe className="spotify-player" title={`Listen to ${post.albumName} by ${post.artistName} on Spotify`}
                  src={`https://open.spotify.com/embed/track/${post.spotifyTrackId}`} width="100%" height="152"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowFullScreen loading="lazy" />
              ) : preview ? (
                <>
                  <p className="muted">Song preview</p>
                  <audio controls preload="none" src={preview} aria-label="Song preview" />
                </>
              ) : <p className="muted">No listening link or audio preview was included with this share.</p>}
              {spotify && <a className="inline-link justify-self-start" href={spotify}>Listen on Spotify</a>}
            </section>
            <section className="auth-form mt-3">
              <h2 className="section-title">Post actions</h2>
              <div className="actions">
                <button type="button" className="action action--secondary" onClick={() => void copyLink()}>Copy link</button>
                {account?.getCurrentUser?.id === post.author.id && (
                  <button type="button" className="action action--danger" aria-haspopup="dialog"
                    onClick={() => { setDeleteError(""); setConfirm(true); }}>Delete post</button>
                )}
              </div>
              <p className={copyState ? "muted" : "sr-only"} role="status">{copyState}</p>
              {manualLink && <input ref={linkField} className="field-control" aria-label="Link to this post" readOnly value={manualLink} />}
              {account?.getCurrentUser?.id === post.author.id && <p className="field-hint">Published posts can be deleted. Editing isn’t available yet.</p>}
            </section>
          </div>
        </article>
      </main>
      <Modal opened={confirm} onClose={() => { if (!deleting) setConfirm(false); }} title="Delete this post?" centered
        closeOnClickOutside={!deleting} closeOnEscape={!deleting} withCloseButton={false}>
        <div className="auth-form">
          <p>This permanently removes the song and your recommendation from the feed.</p>
          {deleteError && <p className="field-error" role="alert">{deleteError}</p>}
          <div className="actions">
            <button type="button" className="action action--secondary" data-autofocus disabled={deleting} onClick={() => setConfirm(false)}>Cancel</button>
            <button type="button" className="action action--danger" disabled={deleting} onClick={() => void removePost()}>
              {deleting ? "Deleting…" : "Delete post"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
