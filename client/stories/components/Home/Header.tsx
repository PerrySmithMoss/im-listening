import { Button } from "@mantine/core";
import React from "react";
import HeaderStyles from "./home.module.css";

//  const HomeHeroBanner1 = require("../../assets/home-hero_image1.png") as string;

interface HeaderProps {
  onCreateAccount?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateAccount }) => {
  return (
    <div className="hero pt-16 pb-10 max-w-[90rem] mx-auto">
      <div className="container px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto">
        <div className="hero-wrapper grid grid-cols-1 md:grid-cols-12 gap-8 justify-center items-center mx-20">
          <div className="hero-text col-span-6">
            <h1 className=" font-bold text-4xl md:text-6xl max-w-xl  leading-tight">
              Listening is  everything
              {/* <span className="text-brand-orange"> */}
                 {/* everything */}
                {/* </span> */}
            </h1>
            <hr className="w-12 h-2 bg-brand-orange rounded-full mt-8" />
            <p className="text-base max-w-[400px] leading-relaxed mt-8 ">
              What are you waiting for? Join the millions and share what you're
              listening to.
            </p>
            <div className="flex content-center items-center space-x-4 mt-8 justify-center md:justify-start">
              {/* <Button className="px-7" radius="xl" size="lg" color="orange">
                Share
              </Button> */}
            <a className=" cursor-pointer text-lg bg-brand-orange px-8 py-2.5 text-white rounded hover:bg-brand-orange_hover">Share</a>
            {/* <a className=" cursor-pointer text-lg border border-brand-orange hover:border-brand-orange_hover  px-7 py-2.5 text-brand-orange rounded hover:text-brand-orange_hover">Explore</a> */}

              <a className={`flex text-lg cursor-pointer text-brand-orange hover:text-brand-orange_hover items-center content-center`}>
                Explore
              </a>
            </div>
          </div>
          <div className="hero-image col-span-6 justify-self-end">
            <img
              //  className={`${HeaderStyles.homeHeroImage}`}
              src="/assets/home-hero_image1.png"
              alt="Two people dancing to music"
            />
          </div>
        </div>
      </div>
    </div>
  );
};