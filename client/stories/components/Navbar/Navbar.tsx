import React, { useState } from "react";
import { Button } from "../Old/Button";
import { Logo } from "../Logo/Logo";
import styles from "./navbar.module.css";
import Image from "next/image";

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
            <a className={`${styles.sidebarMenuUlLiA}`} href="">
              Home
            </a>
          </li>
          <li className={`${styles.sidebarMenuUlLi}`}>
            <a className={`${styles.sidebarMenuUlLiA}`} href="">
              Latest
            </a>
          </li>
          <li className={`${styles.sidebarMenuUlLi}`}>
            <a className={`${styles.sidebarMenuUlLiA}`} href="">
              Popular
            </a>
          </li>
          <li className={`${styles.sidebarMenuUlLi}`}>
            <a className={`${styles.sidebarMenuUlLiA}`} href="">
              Archive
            </a>
          </li>
        </ul>
      </div>
      <header>
        <div className={`${styles.heading}`}>
          <div className={`${styles.logoHeadingWrapper}`}>
            <Logo primary={primary} size="small" />
            <h1 className={`${styles.navbarHeading}`}>I'm Listening</h1>
            <ul className={`${styles.navLinks}`}>
              <li className={`${styles.navLinksLi}`}>
                <a className={`${styles.navLinksLiA}`} href="#">
                  Home
                </a>
              </li>
              <li className={`${styles.navLinksLi}`}>
                <a className={`${styles.navLinksLiA}`} href="#">
                  Latest
                </a>
              </li>
              <li className={`${styles.navLinksLi}`}>
                <a className={`${styles.navLinksLiA}`} href="#">
                  Popular
                </a>
              </li>
              <li className={`${styles.navLinksLi}`}>
                <a className={`${styles.navLinksLiA}`} href="#">
                  Archive
                </a>
              </li>
            </ul>
          </div>

          <div className={`${styles.userState}`}>
            {user ? (
              <>
                <div className={`${styles.userProfile}`}>
                  <a href="#">
                    <Image
                      className={`${styles.userProfileImage}`}
                      src="/assets/user-avatar.jpeg"
                      alt="User avatar"
                      height={40}
                      width={40}
                    />
                  </a>
                  <a href="#">
                    {/* <Image
                      className="user-profile_expand"
                      src={ChevronDown}
                      alt="ChevronDown"
                      height={15}
                      width={10}
                    /> */}
                  </a>
                  {/* <Button size="small" onClick={onLogout} label="Log out" /> */}
                </div>
              </>
            ) : (
              <>
                <Button size="small" onClick={onLogin} label="Log in" />
                <Button
                  color={primary}
                  primary
                  size="small"
                  onClick={onCreateAccount}
                  label="Sign up"
                />
              </>
            )}
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
      </header>
    </>
  );
};
