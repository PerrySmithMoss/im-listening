import { Avatar } from "@mantine/core";
import Link from "next/link";
import React from "react";

interface UserPostsCardProps {
  post: any;
}

export const UserPostsCard: React.FC<UserPostsCardProps> = ({ post }) => {
  return (
    <Link key={post.id} href="/post/[id]" as={`/post/${post.id}`}>
      <div className="">
        <div className="  flex hover:shadow-lg rounded">
          <div className="">
            <img
              className={`h-full w-full rounded-l`}
              src={
                post.albumImage === ""
                  ? "/assets/KOD.jpg"
                  : `${post.albumImage as string}`
              }
              alt="Album cover artwork"
            />
          </div>
          <div className={`flex pl-3 pt-3`}>
            <div>
              <Avatar
                radius="xl"
                src={post.author.profile.avatar}
              />
            </div>
            <div className={`pl-3`}>
              <p className={``} style={{ fontWeight: "bold" }}>
                {post.author.firstName} {post.author.lastName}
              </p>
              <a href="" className={``}>
                <span style={{ color: "#0f8deb", fontSize: "0.8rem" }}>
                  {post.author.username}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
