import { useState } from "react";
import Link from "next/link";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { ActionIcon, Avatar, Modal, Popover, useMantineColorScheme } from "@mantine/core";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { GetCurrentUserDocument, LogoutUserDocument } from "../../graphql/generated/graphql";
import { ShareMusic } from "../Modal/ShareMusic";
import { Logo } from "../Logo/Logo";
import styles from "./navbar.module.css";

export function Navbar() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const apollo = useApolloClient();
  const { data, loading } = useQuery(GetCurrentUserDocument, { ssr: false });
  const [logout, { loading: loggingOut }] = useMutation(LogoutUserDocument);
  const [sharing, setSharing] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const user = data?.getCurrentUser;
  const dark = colorScheme === "dark";

  async function signOut() {
    setLogoutError("");
    try {
      await logout();
      setSharing(false);
      await apollo.resetStore();
    } catch {
      setLogoutError("Could not sign out. Please try again.");
    }
  }

  return (
    <header className={`${styles.navbarWrapper} py-4`}>
      <nav className="px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center" aria-label="I'm Listening home">
          <Logo />
          <span className="ml-3 hidden xsm:inline font-semibold text-lg">I&apos;m Listening</span>
        </Link>
        <div className="flex items-center gap-3">
          {loading ? <span role="status">Loading…</span> : user ? (
            <>
              <Popover width={230} position="bottom-end" withArrow>
                <Popover.Target>
                  <button type="button" aria-label="Account menu">
                    <Avatar size={32} radius="xl" src={user.profile?.avatar || "/assets/user-avatar.jpeg"} />
                  </button>
                </Popover.Target>
                <Popover.Dropdown>
                  <p className="mb-2">{user.firstName} {user.lastName}</p>
                  <button type="button" disabled={loggingOut} onClick={signOut} className="hover:text-brand-orange">Log out</button>
                  {logoutError && <p role="alert">{logoutError}</p>}
                </Popover.Dropdown>
              </Popover>
              <button type="button" onClick={() => setSharing(true)} className="px-4 py-2 bg-brand-orange hover:bg-brand-orange_hover rounded text-white text-sm">Share</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand-orange">Log in</Link>
              <Link href="/sign-up" className="rounded bg-brand-orange px-4 py-2 text-white hover:bg-brand-orange_hover">Sign up</Link>
            </>
          )}
          <ActionIcon variant="outline" size="lg" color="orange" onClick={() => toggleColorScheme()} aria-label="Toggle color scheme">
            {dark ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}
          </ActionIcon>
        </div>
      </nav>
      <Modal opened={sharing && Boolean(user)} onClose={() => setSharing(false)} title="What are you listening to?" size={525}>
        <ShareMusic handleCloseModal={() => setSharing(false)} />
      </Modal>
    </header>
  );
}
