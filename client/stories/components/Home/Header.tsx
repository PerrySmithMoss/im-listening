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
              Listening is everything
            </h1>
            <hr className="w-12 h-2 bg-brand-orange rounded-full mt-8" />
            <p className="text-base max-w-[400px] leading-relaxed mt-8 font-semibold">
              What are you waiting for? Join the millions and share what you're
              listening to.
            </p>
            <div className="flex content-center items-center space-x-5 mt-8 justify-center md:justify-start">
              {/* <Button className="px-7" radius="xl" size="lg" color="orange">
                Share
              </Button> */}
            <a className=" cursor-pointer text-lg bg-brand-orange px-6 py-2.5 text-white rounded hover:bg-brand-orange_hover">Share</a>

              <a className={`${HeaderStyles.headerExploreArrow} flex cursor-pointer hover:text-brand-red_hover items-center content-center `}>
                Explore
                  <svg className="h-3 w-3 ml-2 fill-current" viewBox="0 0 11 12" fill="none">
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

{
  /* <section className={`${HeaderStyles.ctaWrapper}`}>
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
     </section>  */
}
