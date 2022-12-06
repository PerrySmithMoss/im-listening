import React from "react";
import SeeAllStyles from "./see-all.module.css";

interface SeeAllProps {
  buttonText: string;
}

export const SeeAll: React.FC<SeeAllProps> = ({ buttonText }) => {
  return (
    <a
      className={`${SeeAllStyles.headerExploreArrow} flex cursor-pointer hover:text-brand-red_hover text-brand-red items-center content-center `}
    >
      {buttonText}
      <svg
        className="h-3 w-3 ml-2 fill-current"
        viewBox="0 0 11 12"
        fill="none"
      >
        <path
          // fill="#74E4A2"
          d="M5 9.4l3.2-3.8L5 1.8a1 1 0 01-.2-.7c0-.3 0-.6.2-.7.4-.4.9-.4 1.2 0L10 4.9c.3.4.3 1 0 1.4L6 10.8c-.3.4-.8.4-1.2 0-.3-.4-.3-1 0-1.4z"
        ></path>
        <path
          // fill="#74E4A2"
          d="M1 4.7a.9.9 0 100 1.8V4.7zm7.4 0H1v1.8h7.4V4.7z"
        ></path>
      </svg>
    </a>
  );
};
