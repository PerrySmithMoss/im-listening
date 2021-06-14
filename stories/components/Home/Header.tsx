import React from "react";
import { Button } from "../../components/Button";
const HomeHeroBanner1 = require("../../assets/home-hero_image1.png") as string;

interface HeaderProps {
  onCreateAccount?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateAccount }) => {
  return (
    <section className="cta-wrapper">
      <div className="cta-item_1">
        <h2>Listening is everything</h2>
        <p className="header-p">Join the millions and share what you're listening to.</p>
        <Button
          primary
          color={true}
          size="large"
          onClick={onCreateAccount}
          label="Share"
        />
      </div>
      <div className="cta-item_2">
        <img
          className="home-hero_image"
          src={HomeHeroBanner1}
          alt="Two people dancing to music"
        />
      </div>
    </section>
  );
};
