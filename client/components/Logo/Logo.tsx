import React from "react";
import Navstyles from "../Navbar/navbar.module.css";
import Image from "next/image";

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
  // const mode = primary
  //   ? PurpleTheme
  //   : OrangeTheme;
  return (
      <Image
        className={`${Navstyles.headphonesLogo}`}
        // src={mode}
        src="/assets/headphones2.svg"
        alt="I'm Listening logo"
        height={40}
        width={40}
      />
  );
};
