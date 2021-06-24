import React from "react";
import styles from "./button.module.css";

export interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: "small" | "medium" | "large";
  /**
   * Button contents
   */
  label: string;
  /**
   * Color of button
   */
  color?: boolean;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export const Button: React.FC<ButtonProps> = ({
  primary = false,
  size,
  backgroundColor,
  label,
  color = false,
  ...props
}) => {
  const mode = primary
    ? `${styles.storybookButtonPrimary}`
    : `${styles.storybookButtonSecondary}`;

  const sizeClass =
    size === "small"
      ? `${styles.small}`
      : size === "medium"
      ? `${styles.medium}`
      : `${styles.large}`;

  const theme = color ? `${styles.orange}` : `${styles.purple}`;
  return (
    <button
      color={theme}
      type="button"
      className={[
        `${styles.storybookButton}`,
        `${styles.storybookButton} ${sizeClass}`,
        mode,
        theme,
      ].join(" ")}
      style={{ backgroundColor }}
      {...props}
    >
      {label}
    </button>
  );
};
