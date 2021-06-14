import React from "react";
import "./logo.css";
const OrangeTheme = require("../../assets/headphones.svg") as string;
const PurpleTheme = require("../../assets/headphones2.svg") as string;

export interface LogoProps {
  /**
   * Orange or Purple Theme?
   */
  primary?: boolean;
  /**
   * How large should the button be?
   */
  size?: "small" | "medium" | "large";
  /**
   * Button contents
   */
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export const Logo: React.FC<LogoProps> = ({
  primary = false,
  size = "medium",
  ...props
}) => {
  const mode = primary 
    ? PurpleTheme
    : OrangeTheme;
  return (
    <img
      className="headphones-logo"
      src={mode}
      alt="I'm Listening logo"
    />
  );
};
