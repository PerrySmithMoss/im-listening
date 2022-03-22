import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Text, useMantineColorScheme } from "@mantine/core";
import Link from "next/link";
import React from "react";
import Rating from "react-rating";

interface UserPostsCardProps {
  post: any;
}

export const UserPostsCard: React.FC<UserPostsCardProps> = ({ post }) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <Link key={post.id} href="/post/[id]" as={`/post/${post.id}`}>
      <div className="">
        <div
          className={
            colorScheme === "dark"
              ? `cursor-pointer flex hover:bg-[#2b2c3d] rounded`
              : `flex cursor-pointer hover:bg-gray-200 rounded`
          }
        >
          <div className=" max-w-[220px]">
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
          <div className={` pl-3 pt-3`}>
            <div className="flex ">
            <div>
              <Avatar radius="xl" src={post.author.profile.avatar} />
            </div>
            <div className={`pl-3`}>
              <p className={`font-bold`}>
                {post.author.firstName} {post.author.lastName}
              </p>
              <a style={{ color: "#0f8deb", fontSize: "0.8rem" }}>
                {post.author.username}
              </a>
            </div>
            </div>
              <div className="ml-3 mt-4">
                <Text className="text-[15px] text-gray-400" >
                {post.artistName} - {post.albumName}
                   </Text>
              </div>
              <div className="mt-4 ml-3 ">{post.title}</div>
              <div className="flex ml-3 items-center mt-3">
                <Rating
                  initialRating={post.rating}
                  readonly
                  fractions={2}
                  // placeholderRating={3.5}
                  emptySymbol={
                    <FontAwesomeIcon
                      // size="2x"
                      style={{fontSize: "24px"}}
                      color="gray"
                      icon={faStar}
                    />
                  }
                  placeholderSymbol={
                    <FontAwesomeIcon
                      // size="2x"
                      style={{fontSize: "24px"}}
                      color="gray"
                      icon={faStar}
                    />
                  }
                  fullSymbol={
                    <FontAwesomeIcon
                    style={{fontSize: "24px"}}
                      // size="2x"
                      color="yellow"
                      icon={faStar}
                    />
                  }
                />
              </div>
            </div>
          </div>
        </div>

    </Link>
  );
};
