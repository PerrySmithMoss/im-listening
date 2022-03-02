import React from "react";
import { IWeeklyTopTrack } from "../../../../interfaces/IWeeklyTopTrack";
import { WeeklyTopTrackCard } from "./WeeklyMostPopularCard/WeeklyTopTrackCard";
import { SeeAll } from "../../Button/SeeAll/SeeAll";

interface WeeklyMostPopularProps {}

export const WeeklyMostPopular: React.FC<WeeklyMostPopularProps> = ({}) => {
  return (
    <section className="px-4 sm:px-8 lg:px-16 xl:px-20 my-16 max-w-[90rem] mx-auto">
      <div className="flex justify-between content-center items-center">
        <div>
          <h2 className="pb-6 text-3xl font-bold">Weekly Most Popular</h2>
        </div>
        <div>
          <SeeAll buttonText="See all"/>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-8">
        {weeklyTopTracks.map((track: IWeeklyTopTrack) => (
          <WeeklyTopTrackCard key={track.id} card={track} />
        ))}
      </div>
    </section>
  );
};

const weeklyTopTracks: IWeeklyTopTrack[] = [
  {
    id: 1,
    image: "/assets/images/home/WeeklyTopTracks/sza-i-hate-you.png",
    trackTitle: "I Hate You",
    artist: "SZA",
  },
  {
    id: 2,
    image: "/assets/images/home/WeeklyTopTracks/ed-sheeran.jpeg",
    trackTitle: "Peru",
    artist: "Ed Sheeran",
  },
  {
    id: 3,
    image: "/assets/images/home/WeeklyTopTracks/pushin-p.jpg",
    trackTitle: "Pushin P",
    artist: "Gunna",
  },
  {
    id: 4,
    image: "/assets/images/home/WeeklyTopTracks/adele.jpeg",
    trackTitle: "Easy on Me",
    artist: "Adele",
  },
];
