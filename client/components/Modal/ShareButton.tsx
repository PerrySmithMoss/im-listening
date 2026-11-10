import Link from "next/link";
import type { ReactNode } from "react";
import { useShare } from "../../context/Share.context";
import { authHref, sharePath } from "../../lib/returnPath";

export function ShareButton({ children = "Share a song", id }: { children?: ReactNode; id?: string }) {
  const { open, signedIn, loading } = useShare();
  if (signedIn || loading) return <button id={id} type="button" className="action" aria-haspopup="dialog" disabled={loading && !signedIn} onClick={open}>{children}</button>;
  return <Link id={id} href={authHref("/login", sharePath)} className="action">{children}</Link>;
}
