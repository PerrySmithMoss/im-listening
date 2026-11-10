import { Skeleton } from "@mantine/core";
import { ShareButton } from "../Modal/ShareButton";

export function Header({ signedIn, loading }: { signedIn: boolean; loading: boolean }) {
  if (loading && !signedIn) {
    return (
      <section className="hero" aria-label="Homepage introduction" aria-busy="true">
        <div className="hero-copy" aria-hidden="true">
          <Skeleton height={42} width="min(100%, 24rem)" />
          <Skeleton height={24} width="min(100%, 22rem)" />
          <Skeleton height={44} width={126} />
        </div>
      </section>
    );
  }

  return (
    <section className={`hero${signedIn ? "" : " hero--public"}`}>
      <div className="hero-copy">
        <h1 className="page-title">{signedIn ? "What are you listening to?" : "Good music is better shared."}</h1>
        <p className="muted">{signedIn ? "Tell the community about a song you love." : "Share a song you love, say why, and find your next favourite."}</p>
        <div className="actions">
          <ShareButton id="home-share" />
          {!signedIn && <a className="action action--secondary" href="#latest-shares">Browse songs</a>}
        </div>
      </div>
      {!signedIn && <div className="hero-art" aria-hidden="true" />}
    </section>
  );
}
