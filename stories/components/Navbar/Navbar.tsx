import React from "react";
import { Button } from "../Button";
import { Logo } from "../Logo/Logo";
import "./navbar.css";

const Headphones = require("../../assets/headphones.svg") as string;

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
  return (
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

        <div>
          {user ? (
            <Button size="small" onClick={onLogout} label="Log out" />
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
        </div>
      </div>
    </header>
  );
};
