import { PostRating } from "../../Rating/Rating";
import type { GetRecentPostsQuery } from "../../../graphql/generated/graphql";
import { Avatar, Text, useMantineColorScheme } from "@mantine/core";
import Link from "next/link";
import React from "react";

interface UserPostsCardProps {
  post: GetRecentPostsQuery["getRecentPosts"]["posts"][number];
}

export const UserPostsCard: React.FC<UserPostsCardProps> = ({ post }) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <Link key={post.id} href={`/post/${post.id}`}>
      <div className="mt-0">
        {/* Mobile */}
        <div className="block xss:hidden">
          <div
            className={
              colorScheme === "dark"
                ? `cursor-pointer flex-col hover:bg-[#2b2c3d] rounded`
                : `flex-col cursor-pointer hover:bg-gray-200 rounded`
            }
          >
            <div className={` pt-3`}>
              <div className="flex ">
                <div>
                  <Avatar size={40} radius="xl" src={post.author.profile?.avatar || "/assets/user-avatar.jpeg"} />
                </div>
                <div className={`pl-2.5`}>
                  <p className={`font-bold text-sm`}>
                    {post.author.firstName} {post.author.lastName}
                  </p>
                  <span className="text-[#0f8deb] text-sm font-semibold">
                    {post.author.username}
                  </span>
                </div>
              </div>
            </div>
            <div className=" w-full mt-2">
              <img
                className={`h-full w-full rounded`}
                src={
                  post.albumImage === ""
                    ? "/assets/KOD.jpg"
                    : `${post.albumImage as string}`
                }
                alt="Album cover artwork"
              />
            </div>
            <div className="ml-0.5 mt-1 text-gray-400">
              <Text className="text-[14px]">
                {post.artistName} - {post.albumName}
              </Text>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-[#0f8deb] text-[15px] font-semibold">
                {post.author.username}
              </span>{" "}
               {post.title}
            </div>
            <div className="flex ml-3 items-center mt-3">
              <PostRating value={post.rating} />
            </div>
          </div>
        </div>
        {/* Desktop */}
        <div className="hidden xss:flex w-full">
          <div
            className={
              colorScheme === "dark"
                ? `cursor-pointer flex hover:bg-[#2b2c3d] rounded w-full`
                : `flex cursor-pointer hover:bg-gray-200 rounded w-full`
            }
          >
            <div className="w-[220px] h-[220px]">
              <img
                className={`h-full w-full rounded`}
                src={
                  post.albumImage === ""
                    ? "/assets/KOD.jpg"
                    : `${post.albumImage as string}`
                }
                alt="Album cover artwork"
              />
            </div>
            <div className={` pl-3 pt-3 flex-1`}>
              <div className="flex ">
                <div>
                  <Avatar radius="xl" src={post.author.profile?.avatar || "/assets/user-avatar.jpeg"} />
                </div>
                <div className={`pl-3`}>
                  <p className={`font-bold`}>
                    {post.author.firstName} {post.author.lastName}
                  </p>
                  <span style={{ color: "#0f8deb", fontSize: "0.8rem" }}>
                    {post.author.username}
                  </span>
                </div>
              </div>
              <div className="ml-3 mt-4">
                <Text className="text-[15px]">
                  {post.artistName} - {post.albumName}
                </Text>
              </div>
              <div className="mt-4 ml-3 ">{post.title}</div>
              <div className="flex ml-3 items-center mt-3">
                <PostRating value={post.rating} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
