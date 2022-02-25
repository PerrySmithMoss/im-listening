import React from "react";
import discoverNewMusicStyles from "./discover-new-music.module.css";

interface DiscoverNewMusicProps {}

export const DiscoverNewMusic: React.FC<DiscoverNewMusicProps> = ({}) => {
  return (
    <div className="px-4 sm:px-8 lg:px-16 xl:px-20  my-10 max-w-[90rem] mx-auto">
      <h2 className="pb-6 text-3xl font-bold">Discover New Music</h2>
      <div className="grid grid-cols-1  md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-6">
        <div className="relative overflow-hidden w-full h-60 rounded-xl">
          <img
            className={`${discoverNewMusicStyles.imageCardBrightness} h-full w-full object-cover`}
            src="/assets/images/home/discover/pop.jpg"
            alt=""
          />
          <h3 className="text-white text-3xl text-center  font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            Pop
          </h3>
        </div>
        <div className="relative overflow-hidden w-full h-60 rounded-xl">
          <img
            className={`${discoverNewMusicStyles.imageCardBrightness} h-full w-full object-cover`}
            src="/assets/images/home/discover/rock.jpg"
            alt=""
          />
          <h3 className="text-white text-3xl text-center  font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            Rock
          </h3>
        </div>
        <div className="relative overflow-hidden w-full h-60 rounded-xl">
          <img
            className={`${discoverNewMusicStyles.imageCardBrightness} h-full w-full object-cover`}
            src="/assets/images/home/discover/electronic.jpeg"
            alt=""
          />
          <h3 className="text-white text-3xl text-center  font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            Electronic
          </h3>
        </div>
        <div className="relative overflow-hidden w-full h-60 rounded-xl">
          <img
            className={`${discoverNewMusicStyles.imageCardBrightness} h-full w-full object-cover`}
            src="/assets/images/home/discover/jazz.jpg"
            alt=""
          />
          <h3 className="text-white text-3xl text-center  font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            Jazz
          </h3>
        </div>
        <div className="relative overflow-hidden w-full h-60 rounded-xl">
          <img
            className={`${discoverNewMusicStyles.imageCardBrightness} h-full w-full object-cover`}
            src="/assets/images/home/discover/dance.jpg"
            alt=""
          />
          <h3 className="text-white text-3xl text-center  font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            Dance
          </h3>
        </div>
        <div className="relative overflow-hidden w-full h-60 rounded-xl">
          <img
            className={`${discoverNewMusicStyles.imageCardBrightness} h-full w-full object-cover`}
            src="/assets/images/home/discover/hip-hop.jpg"
            alt=""
          />
          <h3 className="text-white text-3xl text-center  font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            Hip-hop
          </h3>
        </div>
        <div className="relative overflow-hidden w-full h-60 rounded-xl">
          <img
            className={`${discoverNewMusicStyles.imageCardBrightness} h-full w-full object-cover`}
            src="/assets/images/home/discover/indie.jpg"
            alt=""
          />
          <h3 className="text-white text-3xl text-center  font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            Indie
          </h3>
        </div>
        <div className="relative overflow-hidden w-full h-60 rounded-xl">
          <img
            className={`${discoverNewMusicStyles.imageCardBrightness} h-full w-full object-cover`}
            src="/assets/images/home/discover/classical.jpg"
            alt=""
          />
          <h3 className="text-white text-3xl text-center  font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            Classical
          </h3>
        </div>
      </div>
    </div>
  );
};

{
  /* <Chip value="all">All Categories</Chip>
<Chip value="rock">Rock</Chip>
<Chip value="pop">Pop</Chip>
<Chip value="hipHop">Hip-hop</Chip>
<Chip value="jazz">Jazz</Chip>
<Chip value="dance">Dance</Chip>
<Chip value="electronic">Electronic</Chip>
<Chip value="classical">Classical</Chip>
<Chip value="classical">Indie</Chip> */
}
