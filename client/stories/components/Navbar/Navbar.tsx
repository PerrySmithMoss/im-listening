import React, { useRef, useState, useEffect, useMemo } from "react";
import { Button } from "../Old/Button";
import { Logo } from "../Logo/Logo";
import styles from "./navbar.module.css";
import Image from "next/image";
import Link from "next/link";
import {
  useGetCurrentUserQuery,
  useLogoutUserMutation,
} from "../../../graphql/generated/graphql";
import { useApolloClient } from "@apollo/client";
import { isServer } from "../../../utils/isServer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import { ShareMusicModal } from "./ShareMusicModal";
// const UserAvatar = require("../../assets/user-avatar.jpeg") as string;
// const HamburgerMenu = require("../../assets/hamburger-menu.svg") as string;
// const CloseMenu = require("../../assets/close.svg") as string;

export interface NavbarProps {
  user?: {};
  onLogin: () => void;
  onLogout: () => void;
  onCreateAccount: () => void;
  primary: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  primary = false,
  user,
  onLogin,
  onLogout,
  onCreateAccount,
}) => {
  const [sidebar, setSidebar] = useState<null | boolean>(null);
  const apolloClient = useApolloClient();
  const { data, loading } = useGetCurrentUserQuery({ skip: isServer() });
  const [logoutUser] = useLogoutUserMutation();
  let body = null;

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isShareMusicModalOpen, setIsShareMusicModalOpen] = useState(false);
  const handleOpenShareMusicModal = () => {
    setIsShareMusicModalOpen(!isShareMusicModalOpen);
  };
  // data is loading
  if (loading) {
    body = (
      <>
        <h2>Loading...</h2>
      </>
    );
    // user is not logged in
  } else if (!data?.getCurrentUser) {
    body = (
      <>
        <Link href="/login">
          <Button size="small" onClick={onLogin} label="Log in" />
        </Link>
        <Link href="/sign-up">
          <Button
            color={primary}
            primary
            size="small"
            onClick={onCreateAccount}
            label="Sign up"
          />
        </Link>
      </>
    );
    // user is logged in
  } else {
    body = (
      <div className={`${styles.userProfile}`}>
        <div
          style={{ paddingRight: "20px" }}
          className={`${styles.iconBadgeGroup}`}
        >
          <div className={`${styles.iconBadgeContainer}`}>
            <a href="#">
              <FontAwesomeIcon
                color="grey"
                size="lg"
                icon={faBell}
                className={`${styles.iconBadgeIcon}`}
              ></FontAwesomeIcon>
              <div className={`${styles.iconBadge}`}>6</div>
            </a>
          </div>
        </div>
        <div
          style={{ paddingRight: "20px" }}
          className={`${styles.iconBadgeGroup}`}
        >
          <div className={`${styles.iconBadgeContainer}`}>
            <a href="#">
              <FontAwesomeIcon
                color="grey"
                size="lg"
                icon={faComments}
                className={`${styles.iconBadgeIcon}`}
              ></FontAwesomeIcon>
              <div className={`${styles.iconBadge}`}>2</div>
            </a>
          </div>
        </div>

        <div className={`${styles.menuContainer}`}>
          <div style={{ cursor: "pointer" }}>
            {/* <a href="/"> */}
            <img
              className={`${styles.userProfileImage}`}
              src={data.getCurrentUser.profile.avatar as string}
              alt="User avatar"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              // height={40}
              // width={40}
            />
            {/* </a> */}
          </div>
          {/* <div style={{ paddingRight: "10px" }}>
            <Image
              className="user-profile_expand"
              src="/assets/chevron-down.svg"
              alt="ChevronDown"
              height={15}
              width={10}
              onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
            />
          </div> */}
          {isProfileDropdownOpen ? (
            <nav className={styles.profileNavbar}>
              <ul className={styles.profileNavbarNav}>
                <li className={styles.profileNavItem}>
                  <a className={styles.profileNavLink} href="#">
                    Profile
                  </a>
                </li>
                <li className={styles.profileNavItem}>
                  <a className={styles.profileNavLink} href="#">
                    Library
                  </a>
                </li>
                <li className={styles.profileNavItem}>
                  <a className={styles.profileNavLink} href="#">
                    Settings
                  </a>
                </li>
                <li className={styles.profileNavItem}>
                  <a
                    onClick={async () => {
                      await logoutUser();
                      await apolloClient.resetStore();
                    }}
                    className={styles.profileNavLink}
                    href="/"
                  >
                    Logout
                  </a>
                </li>
              </ul>
            </nav>
          ) : (
            false
          )}
          {/* <div>
            <button
              onClick={async () => {
                await logoutUser();
                await apolloClient.resetStore();
              }}
            >
              Logout
            </button>
          </div> */}
          {/* <Button size="small" onClick={logoutUser} label="Log out" /> */}
        </div>
        <button
          onClick={() => setIsShareMusicModalOpen(!isShareMusicModalOpen)}
          className={styles.shareBtn}
        >
          Share
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={
          `${styles.navigation} ` + (sidebar ? `${styles.navigationOpen}` : "")
        }
      >
        <br></br>
        <div className={`${styles.sidebarMenu}`}>
          <div>
            <span className={`${styles.sidebarHeading}`}>I'm Listening</span>
          </div>
          <div>
            <Image
              onClick={() => setSidebar(!sidebar)}
              className={`${styles.closeMenuImage}`}
              src="/assets/close.svg"
              alt="Close menu"
              height={20}
              width={20}
            />
          </div>
        </div>
        <hr className={`${styles.sidebarDivider}`} />
        <ul className={`${styles.sidebarMenuUl}`}>
          <li className={`${styles.sidebarMenuUlLi}`}>
            <Link href="/">
              <a className={`${styles.sidebarMenuUlLiA}`}>Home</a>
            </Link>
          </li>
          <li className={`${styles.sidebarMenuUlLi}`}>
            <Link href="/latest">
              <a className={`${styles.sidebarMenuUlLiA}`}>Latest</a>
            </Link>
          </li>
          <li className={`${styles.sidebarMenuUlLi}`}>
            <Link href="/popular">
              <a className={`${styles.sidebarMenuUlLiA}`}>Popular</a>
            </Link>
          </li>
          <li className={`${styles.sidebarMenuUlLi}`}>
            <Link href="/archive">
              <a className={`${styles.sidebarMenuUlLiA}`}>Archive</a>
            </Link>
          </li>
        </ul>
      </div>
      <header>
        <div className={`${styles.heading}`}>
          <div className={`${styles.logoHeadingWrapper}`}>
            <Logo primary={primary} size="small" />
            <Link href="/">
              <h1 className={`${styles.navbarHeading}`}>I'm Listening</h1>
            </Link>
            <ul className={`${styles.navLinks}`}>
              <li className={`${styles.navLinksLi}`}>
                <Link href="/">
                  <a className={`${styles.navLinksLiA}`}>Home</a>
                </Link>
              </li>
              <li className={`${styles.navLinksLi}`}>
                <Link href="/latest">
                  <a className={`${styles.navLinksLiA}`}>Latest</a>
                </Link>
              </li>
              <li className={`${styles.navLinksLi}`}>
                <Link href="/popular">
                  <a className={`${styles.navLinksLiA}`}>Popular</a>
                </Link>
              </li>
              <li className={`${styles.navLinksLi}`}>
                <Link href="/archive">
                  <a className={`${styles.navLinksLiA}`}>Archive</a>
                </Link>
              </li>
            </ul>
          </div>

          <div className={`${styles.userState}`}>
            {body}
            <div className={`${styles.hamburgerMenu}`}>
              <Image
                onClick={() => setSidebar(!sidebar)}
                id={`${styles.hamburgerMenuImage}`}
                className={`${styles.hamburgerMenuImage}`}
                src="/assets/hamburger-menu.svg"
                alt="Hamburger menu"
                height={30}
                width={30}
              />
            </div>
          </div>
        </div>
        <ShareMusicModal
          isShareMusicModalOpen={isShareMusicModalOpen}
          setIsShareMusicModalOpen={setIsShareMusicModalOpen}
        />
      </header>
    </>
  );
};
