import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { Popover, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { SunIcon, MoonIcon, PlusIcon } from "@radix-ui/react-icons";
import { GetCurrentUserDocument, LogoutUserDocument } from "../../graphql/generated/graphql";
import { useShare } from "../../context/Share.context";
import { authHref } from "../../lib/returnPath";
import { UserAvatar } from "../Post/PostMedia";
import { Logo } from "../Logo/Logo";

export function Navbar() {
  const { toggleColorScheme } = useMantineColorScheme();
  const dark = useComputedColorScheme("light") === "dark";
  const apollo = useApolloClient();
  const { data, loading } = useQuery(GetCurrentUserDocument);
  const [logout, { loading: loggingOut }] = useMutation(LogoutUserDocument);
  const [logoutError, setLogoutError] = useState("");
  const [menu, setMenu] = useState(false);
  const user = data?.getCurrentUser;
  const { open } = useShare();
  const { pathname, query, isReady } = useRouter();
  const intended = pathname === "/post/[id]" && typeof query.id === "string"
    ? `/post/${query.id}` : pathname === "/account/sign-in" ? pathname : isReady ? query.next : undefined;

  async function signOut() {
    setLogoutError("");
    try {
      const { data } = await logout();
      if (!data?.logoutUser) throw new Error();
      setMenu(false);
      await apollo.resetStore();
    } catch {
      setLogoutError("Could not sign out. Please try again.");
    }
  }

  return (
    <header className="site-header">
      <nav aria-label="Main navigation" className="page-width site-nav">
        <Link href="/" className="site-brand" aria-label="I'm Listening home">
          <Logo />
          <span>I&apos;m Listening</span>
        </Link>
        <div className="site-nav-actions">
          {user ? (
            <>
              <button type="button" aria-haspopup="dialog" onClick={open} className="action desktop-share">Share a song</button>
              <Popover opened={menu} onChange={setMenu} width={230} position="bottom-end" withArrow trapFocus returnFocus>
                <Popover.Target>
                  <button type="button" aria-label="Account menu" className="action action--secondary nav-icon account-avatar"
                    onClick={() => { setLogoutError(""); setMenu(!menu); }}>
                    <UserAvatar src={user.profile?.avatar} firstName={user.firstName} lastName={user.lastName} />
                  </button>
                </Popover.Target>
                <Popover.Dropdown>
                  <div className="auth-form">
                    <p className="wrap-anywhere font-semibold">{user.firstName} {user.lastName}</p>
                    <Link href="/account/sign-in" className="inline-link" onClick={() => setMenu(false)}>Sign-in methods</Link>
                    <button className="action action--secondary" type="button" disabled={loggingOut} onClick={() => void signOut()}>
                      {loggingOut ? "Logging out…" : "Log out"}
                    </button>
                    {logoutError && <p role="alert" className="field-error">{logoutError}</p>}
                  </div>
                </Popover.Dropdown>
              </Popover>
            </>
          ) : (
            <>
              {loading && <span className="sr-only" role="status">Checking sign-in…</span>}
              <Link href={authHref("/login", intended)} className="inline-link">Log in</Link>
              <Link href={authHref("/sign-up", intended)} className="action">Sign up</Link>
            </>
          )}
          <button type="button" className="action action--secondary nav-icon" onClick={() => toggleColorScheme()}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
            {dark ? <SunIcon aria-hidden="true" width={19} height={19} /> : <MoonIcon aria-hidden="true" width={19} height={19} />}
          </button>
        </div>
      </nav>
      {user && (
        <button type="button" aria-label="Share a song" aria-haspopup="dialog" onClick={open} className="action floating-share">
          <PlusIcon aria-hidden="true" width={25} height={25} />
        </button>
      )}
    </header>
  );
}
