import React from "react";
import { Card, Group, Badge, Text } from "@mantine/core";
import { IPromotedArtist } from "../../../interfaces/IPromotedArtist";
import { SeeAll } from "../../Button/SeeAll/SeeAll";

interface PromotedArtistsProps {}

export const PromotedArtists: React.FC<PromotedArtistsProps> = ({}) => {
  return (
    <section className="px-4 sm:px-8 lg:px-16 xl:px-20 max-w-[90rem] mx-auto mb-10 ">
      <div className="flex justify-between items-center pb-6">
        <div>
          <h2 className="text-3xl font-bold">Promoted Artists</h2>
        </div>
        <div>
          <SeeAll buttonText="See all"/>
        </div>
      </div>
      <div className="">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
          {promotedArtists.map((promotedArtist: IPromotedArtist) => (
            <article
              key={promotedArtist.id}
              className="flex flex-col rounded-lg cursor-pointer pb-1"
            >
              <div className="flex justify-center overflow-hidden relative">
                <img
                  className="w-full h-64 object-cover object-center "
                  src={promotedArtist.artistImage}
                  alt="Artist Photo"
                  // height={278}
                  // width={278}
                />
              </div>
              <div
                className="mt-3 ml-1"
                style={{ marginBottom: 5, marginTop: 10 }}
              >
                <Text weight={700}>{promotedArtist.artistName}</Text>
                <Text
                  className="mt-1"
                  size="sm"
                  style={{ lineHeight: 1.5 }}
                >
                  Hip-hop
                </Text>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const promotedArtists: IPromotedArtist[] = [
  {
    id: 1,
    artistImage: "/assets/images/home/promoted-artists/dave.jpg",
    artistName: "Dave",
    inTheTop: 3,
    mostSharedSong: "Clash",
  },
  {
    id: 2,
    artistImage: "/assets/images/home/promoted-artists/tool.jpg",
    artistName: "Tool",
    inTheTop: 1,
    mostSharedSong: "The Pot",
  },
  {
    id: 3,
    artistImage: "/assets/images/home/promoted-artists/the-weekend.jpg",
    artistName: "The Weekend",
    inTheTop: 12,
    mostSharedSong: "The Hills",
  },
  {
    id: 4,
    artistImage: "/assets/images/home/promoted-artists/meg-thee-stallion.jpg",
    artistName: "Megan Thee Stallion",
    inTheTop: 1,
    mostSharedSong: "WAP",
  },
];
