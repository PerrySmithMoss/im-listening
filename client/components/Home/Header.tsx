import { Button } from "@mantine/core";
import { useRouter } from "next/dist/client/router";
import React from "react";
import Link from "next/link";
import { useGetCurrentUserQuery } from "../../graphql/generated/graphql";
import { isServer } from "../../utils/isServer";
import HeaderStyles from "./home.module.css";

//  const HomeHeroBanner1 = require("../../assets/home-hero_image1.png") as string;

interface HeaderProps {
  onCreateAccount?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateAccount }) => {
  const { data: user, loading: userLoading } = useGetCurrentUserQuery({
    skip: isServer(),
  });
  const router = useRouter();
  const handleShareMusic = () => {
    if (!user?.getCurrentUser) {
      // User not logged in, ask them to sign up to share
      router.push("/login");
    }
  };
  return (
    <div className="hero pt-14 xss:pt-16 pb-12 xss:max-w-[90rem] xss:mx-auto">
      <div className="container px-4 sm:px-8 lg:px-16 xl:px-20 xss:mx-auto">
        <div className="hero-wrapper grid grid-cols-1 md:grid-cols-12 gap-8 justify-center items-center mx-1 xss:mx-20">
          <div className="hero-text col-span-6">
            <h1 className=" font-bold text-[42px] md:text-6xl max-w-xl leading-tight">
              Listening is <span className=" text-brand-orange">everything</span>
            </h1>
            <div className="w-12 h-2 bg-brand-orange rounded-full mt-8" />
            <p className="text-base xss:max-w-[300px] mt-8 ">
              What are you waiting for? Share what you're
              listening to now.
            </p>
            <div className="flex content-center items-center space-x-4 mt-8">
              <a
                onClick={handleShareMusic}
                className=" cursor-pointer xss:text-lg bg-brand-orange px-8 py-2.5 text-white rounded hover:bg-brand-orange_hover"
              >
                Share
              </a>
              {/* <Link href="explore">
                <a
                  className={`flex xss:text-lg cursor-pointer text-brand-orange hover:text-brand-orange_hover items-center content-center`}
                >
                  Explore
                </a>
              </Link> */}
            </div>
          </div>
          <div className="hidden md:block hero-image col-span-6 justify-self-end">
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
