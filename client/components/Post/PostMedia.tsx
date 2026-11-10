import Image from "next/image";
import { useState } from "react";

export const fallbackArtwork = "/assets/music-artwork.svg";
export const socialArtwork = "/assets/music-artwork.png";

export function mediaUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function isSpotifyArtwork(url: string) {
  return /^https:\/\/i\.scdn\.co\/image\/[a-f0-9]+$/.test(url);
}

type ArtworkProps = { src?: string | null; alt?: string; sizes: string; eager?: boolean };

export function Artwork(props: ArtworkProps) {
  const url = mediaUrl(props.src);
  return <ArtworkImage key={url} {...props} src={url} />;
}

function ArtworkImage({ src, alt = "", sizes, eager }: ArtworkProps) {
  const [failed, setFailed] = useState(false);
  const url = !failed && src ? src : fallbackArtwork;
  // Optimise only the known Spotify image CDN. Other user-supplied URLs load
  // directly in the browser and are never fetched by the app's server.
  const optimisable = isSpotifyArtwork(url);
  return (
    <span className="artwork">
      <Image src={url} alt={url === fallbackArtwork ? "" : alt} width={640} height={640} sizes={sizes}
        unoptimized={!optimisable} loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} />
    </span>
  );
}

type AvatarProps = { src?: string | null; firstName: string; lastName: string };

export function UserAvatar(props: AvatarProps) {
  const url = mediaUrl(props.src);
  return <AvatarImage key={url} {...props} src={url} />;
}

function AvatarImage({ src, firstName, lastName }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = [firstName, lastName].map((name) => Array.from(name.trim())[0] ?? "").join("").toUpperCase();
  return (
    <span className="avatar" aria-hidden="true">
      {src && !failed
        ? <Image src={src} alt="" width={48} height={48} unoptimized loading="lazy" onError={() => setFailed(true)} />
        : initials || "♪"}
    </span>
  );
}
