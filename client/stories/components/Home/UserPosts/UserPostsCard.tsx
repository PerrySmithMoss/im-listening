import { Avatar } from "@mantine/core";
import Link from "next/link";
import React from "react";

interface UserPostsCardProps {
  post: any;
}

export const UserPostsCard: React.FC<UserPostsCardProps> = ({ post }) => {
  return (
    <Link key={post.id} href="/post/[id]" as={`/post/${post.id}`}>
      <div className="flex lg:justify-center">
        <div className="bg-whitemx-8 flex max-w-5xl shadow-md hover:shadow-lg rounded-sm">
          <div className="lg:w-1/2">
            <img
              className={`h-full w-full`}
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
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80"
              />
            </div>
            <div className={`pl-3`}>
              <p className={``} style={{ color: "black", fontWeight: "bold" }}>
                {`${post.author.firstName} ${post.author.lastName}`}
              </p>
              <a href="" className={``}>
                <span style={{ color: "#0f8deb", fontSize: "0.8rem" }}>
                  {`${post.author.username}`}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
