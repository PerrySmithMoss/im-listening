import React from "react";
import { Button } from "../Old/Button";
import HeaderStyles from "./home.module.css"

// const HomeHeroBanner1 = require("../../assets/home-hero_image1.png") as string;

interface HeaderProps {
  onCreateAccount?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateAccount }) => {
  return (
    <section className={`${HeaderStyles.ctaWrapper}`}>
      <div className={`${HeaderStyles.ctaItem1}`}>
        <h2 className={`${HeaderStyles.headerH2}`}>Listening is everything</h2>
        <p className={`${HeaderStyles.headerP}`}>Join the millions and share what you're listening to.</p>
        <Button
          primary
          color={true}
          size="large"
          onClick={onCreateAccount}
          label="Share"
        />
      </div>
      <div className={`${HeaderStyles.ctaItem2}`}>
        <img
          className={`${HeaderStyles.homeHeroImage}`}
          src="/assets/home-hero_image1.png"
          alt="Two people dancing to music"
        />
      </div>
    </section>
  );
};
