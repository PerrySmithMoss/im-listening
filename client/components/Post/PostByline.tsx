import { useEffect, useState } from "react";
import { UserAvatar } from "./PostMedia";

const exactDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
const relativeTime = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });

function PostedAt({ value }: { value: string }) {
  const date = new Date(value);
  const exact = `${exactDate.format(date)} UTC`;
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const minutes = now === null ? null : Math.max(0, Math.floor((now - date.getTime()) / 60_000));
  const relative = minutes === null || minutes >= 60 * 24 * 7 ? exact :
    minutes < 1 ? "just now" :
    minutes < 60 ? relativeTime.format(-minutes, "minute") :
    minutes < 24 * 60 ? relativeTime.format(-Math.floor(minutes / 60), "hour") :
    relativeTime.format(-Math.floor(minutes / (24 * 60)), "day");
  return <time dateTime={value} title={exact} aria-label={relative === exact ? exact : `${relative}, ${exact}`}>{relative}</time>;
}

export function PostByline({ author, createdAt }: {
  author: { firstName: string; lastName: string; username: string; profile?: { avatar?: string | null } | null };
  createdAt: string;
}) {
  const name = [author.firstName, author.lastName].filter(Boolean).join(" ") || author.username;
  return (
    <div className="post-byline wrap-anywhere">
      <UserAvatar src={author.profile?.avatar} firstName={author.firstName} lastName={author.lastName} />
      <p><strong>{name}</strong> <span className="muted">· <PostedAt value={createdAt} /></span></p>
    </div>
  );
}
