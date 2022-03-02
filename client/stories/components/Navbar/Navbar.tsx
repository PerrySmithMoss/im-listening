import React, { useRef, useState, useEffect, useMemo } from "react";
// import { Button } from "../Old/Button";
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
import {
  ActionIcon,
  Avatar,
  Modal,
  Popover,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import {
  SunIcon,
  MoonIcon,
  BellIcon,
  ChatBubbleIcon,
} from "@modulz/radix-icons";
import { ShareMusicModal } from "./ShareMusicModal";
import { ShareMusic } from "../Modal/ShareMusic";
import { useGlobalUIContext } from "../../../context/GlobalUI.context";
// const UserAvatar = require("../../assets/user-avatar.jpeg") as string;
// const HamburgerMenu = require("../../assets/hamburger-menu.svg") as string;
// const CloseMenu = require("../../assets/close.svg") as string;

export interface NavbarProps {
  user?: {};
  onLogin: () => void;
  onLogout: () => void;
  onCreateAccount: () => void;
  primary: boolean;
  songAudio: boolean
}

export const Navbar: React.FC<NavbarProps> = ({
  primary = false,
  user,
  onLogin,
  onLogout,
  onCreateAccount,
  songAudio
}) => {
  const [sidebar, setSidebar] = useState<null | boolean>(null);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const apolloClient = useApolloClient();
  const { data, loading } = useGetCurrentUserQuery({ skip: isServer() });
  const [logoutUser] = useLogoutUserMutation();
  let body = null;
  const {
    isMusicPlaying,
    setIsMusicPlaying,
    playingTrackState,
    setPlayingTrackState,
    isShowMusicPlayerOpen,
    setIsShowMusicPlayerOpen,
    chosenSong,
    setChosenSong,
  } = useGlobalUIContext();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isShareMusicModalOpen, setIsShareMusicModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsShareMusicModalOpen(false)
    setIsShowMusicPlayerOpen(false)
    setIsMusicPlaying(false)
  }
  // data is loading
  // if (loading) {
  //   body = (

  //       <div>Loading...</div>

  //   );
  //   // user is not logged in
  // } else
  if (!data?.getCurrentUser) {
    body = (
      <ul className="flex content-center items-center text-base">
        <li>
          <Link href="/login">
            {/* <a className="text-[#fd7e14] text-[15px] hover:text-brand-orange_hover">
              Log in
            </a> */}
            <Text className=" cursor-pointer hover:text-brand-orange">
              Log in
            </Text>
          </Link>
        </li>
        <li className="pr-5">
          <Link href="/sign-up">
            {/* <Button radius="xl" size="sm" color="orange">
              Sign up
            </Button> */}
            <a className="ml-5 rounded sr bg-brand-orange px-5 py-2.5 text-white hover:bg-brand-orange_hover">
              Sign up
            </a>
          </Link>
        </li>
        <li>
          <ActionIcon
            variant="outline"
            size="lg"
            color={dark ? "orange" : "orange"}
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
          >
            {dark ? (
              <SunIcon style={{ width: 18, height: 18 }} />
            ) : (
              <MoonIcon style={{ width: 18, height: 18 }} />
            )}
          </ActionIcon>
        </li>
      </ul>
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
              <ActionIcon variant="hover">
                <BellIcon style={{ width: 24, height: 24 }} />
                <div className={`${styles.iconBadge}`}>
                  <div className="absoloute absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    6
                  </div>
                </div>
              </ActionIcon>
            </a>
          </div>
        </div>
        <div
          style={{ paddingRight: "20px" }}
          className={`${styles.iconBadgeGroup}`}
        >
          <div className={`${styles.iconBadgeContainer}`}>
            <a href="#">
              <ActionIcon variant="hover">
                <ChatBubbleIcon style={{ width: 24, height: 24 }} />
                <div className={`${styles.iconBadge}`}>
                  <div className="absoloute absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    2
                  </div>
                </div>
              </ActionIcon>
            </a>
          </div>
        </div>
        <Popover
          opened={isProfileDropdownOpen}
          onClose={() => setIsProfileDropdownOpen(false)}
          target={
            <Avatar
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              size="md"
              radius="xl"
              src={data.getCurrentUser.profile.avatar as string}
            />
          }
          width={260}
          position="bottom"
          withArrow
        >
          <div>
            <Text
              onClick={async () => {
                await logoutUser();
                await apolloClient.resetStore();
              }}
              size="sm"
            >
              Logout
            </Text>
          </div>
        </Popover>
        {/* <div className={`${styles.menuContainer}`}>
          <div className={`${styles.menuItem}`}>
            <Avatar
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              size="md"
              radius="xl"
              src={data.getCurrentUser.profile.avatar as string}
            />
          </div>
          {isProfileDropdownOpen ? (
            <div className={`${styles.dropDownMenu}`}>
              <a className={styles.profileNavLink} href="#">
                <p>Profile</p>
              </a>

              <a className={styles.profileNavLink} href="#">
                <p>Library</p>
              </a>

              <a className={styles.profileNavLink} href="#">
                <p>Settings</p>
              </a>

              <a className={styles.profileNavLink} href="/">
                <p
                  onClick={async () => {
                    await logoutUser();
                    await apolloClient.resetStore();
                  }}
                >
                  Logout
                </p>
              </a>
            </div>
          ) : (
            false
          )}
        </div> */}
        <button
          onClick={() => setIsShareMusicModalOpen(!isShareMusicModalOpen)}
          className={styles.shareBtn}
        >
          Share
        </button>
        <div className="ml-4">
          <ActionIcon
            variant="outline"
            size="lg"
            color={dark ? "orange" : "orange"}
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
          >
            {dark ? (
              <SunIcon style={{ width: 18, height: 18 }} />
            ) : (
              <MoonIcon style={{ width: 18, height: 18 }} />
            )}
          </ActionIcon>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={
          `${styles.navigation} max-w-[90rem]` +
          (sidebar ? `${styles.navigationOpen}` : "")
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
              <a className={`${styles.sidebarMenuUlLiA}`}>About</a>
            </Link>
          </li>
        </ul>
      </div>
      <header
        className={`${styles.navbarWrapper} py-4 header max-w-[90rem] mx-auto`}
      >
        <div className=" px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto">
          <nav className="header-wrapper flex items-center justify-between">
            <div className="header-logo flex content-center items-center">
              <Link href="/">
                <a className="cursor-pointer flex content-center items-center">
                  <Logo primary={primary} size="small" />

                  <div className="ml-3 cursor-pointer">
                    <h1 className="font-semibold text-lg leading-relaxed">
                      I'm Listening
                    </h1>
                  </div>
                </a>
              </Link>
            </div>

            <div className="toggle md:hidden">
              <button>
                <svg
                  className="h-6 w-6 fill-current text-black"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>

            <div className="navbar hidden md:block">
              <ul className="flex content-center items-center space-x-8 text-base ">
                <li>
                  <a href="#" className="hover:text-orange-500 pb-2">
                    Explore
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500">
                    Popular
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500">
                    About
                  </a>
                </li>
              </ul>
            </div>

            <div className="navbar hidden md:block">{body}</div>
          </nav>
        </div>
        <Modal
        centered
          opened={isShareMusicModalOpen}
          onClose={handleCloseModal}
          title="What are you listening to?"
          size="xl"
        >
          <hr />
          <ShareMusic songAudio={songAudio}/>
        </Modal>
        {/* <ShareMusicModal
          isShareMusicModalOpen={isShareMusicModalOpen}
          setIsShareMusicModalOpen={setIsShareMusicModalOpen}
        /> */}
      </header>
      {/* <header>
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
      </header> */}
    </>
  );
};
