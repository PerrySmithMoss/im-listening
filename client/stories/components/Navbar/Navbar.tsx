import React, { useState } from "react";
import { Button } from "../Button";
import { Logo } from "../Logo/Logo";
import "./navbar.css";

const UserAvatar = require("../../assets/user-avatar.jpeg") as string;
const ChevronDown = require("../../assets/chevron-down.svg") as string;
const HamburgerMenu = require("../../assets/hamburger-menu.svg") as string;
const CloseMenu = require("../../assets/close.svg") as string;

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
      <div className={"navigation " + (sidebar ? "navigation-open" : "")}>
        <br></br>
        <div className="sidebar-menu">
          <div>
            <span className="sidebar-heading">I'm Listening</span>
          </div>
          <div>
            <img
              onClick={() => setSidebar(!sidebar)}
              className="close-menu_image"
              src={CloseMenu}
              alt="Close menu"
            />
          </div>
        </div>
        <hr className="sidebar-divider" />
        <ul>
          <li>
            <a href="">Home</a>
          </li>
          <li>
            <a href="">Latest</a>
          </li>
          <li>
            <a href="">Popular</a>
          </li>
          <li>
            <a href="">Archive</a>
          </li>
        </ul>
      </div>
      <header>
        <div className="heading">
          <div className="logo-heading_wrapper">
            <Logo primary={primary} size="small" />
            <h1 className="navbar-heading">I'm Listening</h1>
            <ul className="nav-links">
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">Latest</a>
              </li>
              <li>
                <a href="#">Popular</a>
              </li>
              <li>
                <a href="#">Archive</a>
              </li>
            </ul>
          </div>

          <div className="user-state">
            {user ? (
              <>
                <div className="user-profile">
                  <a href="#">
                    <img
                      className="user-profile_image"
                      src={UserAvatar}
                      alt="User avatar"
                    />
                  </a>
                  <a href="#">
                    <img
                      className="user-profile_expand"
                      src={ChevronDown}
                      alt="ChevronDown"
                    />
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
            <div className="hamburger-menu">
              <img
                onClick={() => setSidebar(!sidebar)}
                id="hamburger-menu_image"
                className="hamburger-menu_image"
                src={HamburgerMenu}
                alt="Hamburger menu"
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
