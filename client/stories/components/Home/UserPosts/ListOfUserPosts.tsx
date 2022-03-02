import { Button } from "@mantine/core";
import Link from "next/link";
import React from "react";
import { useGetRecentPostsQuery } from "../../../../graphql/generated/graphql";
import styles from "./user-posts.module.css";
import { UserPostsCard } from "./UserPostsCard";
// const KOD = require("../../assets/KOD.jpg") as string;
// const UserAvatar = require("../../assets/user-avatar.jpeg") as string;

interface ListOfUserPostsProps {
  recentPosts: any;
}

export const ListOfUserPosts: React.FC<ListOfUserPostsProps> = ({
  recentPosts,
}) => {
  const { data, error, loading, fetchMore, variables } = useGetRecentPostsQuery(
    {
      variables: {
        limit: 6,
        cursor: null,
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  const handleFetchMorePosts = async () => {
    await fetchMore({
      variables: {
        limit: variables?.limit,
        cursor:
          data?.getRecentPosts.posts[data.getRecentPosts.posts.length - 1]
            .createdAt,
      },
    });
  };

  return (
    <section className=" mx-auto mt-2">
      <div className="grid grid-cols-2 gap-6 px-4 sm:px-8 lg:px-16 xl:px-20">
        {recentPosts.getRecentPosts.posts.map((post: any) => (
          <UserPostsCard key={post.id} post={post} />
        ))}
      </div>

      {/* <section
        className={`grid grid-cols-2 gap-4 px-4 sm:px-8 lg:px-16 xl:px-20 mx-auto mt-2`}
      >
        {recentPosts.getRecentPosts.posts.map((post: any) => (
          <Link key={post.id} href="/post/[id]" as={`/post/${post.id}`}>
            <div className={`${styles.ListOfPostsA}`}>
              <div key={post.id} className={`${styles.userPostItem}`}>
                <div>
                  <img
                    className={`${styles.albumImage}`}
                    // src="/assets/KOD.jpg"
                    src={
                      post.albumImage === ""
                        ? "/assets/KOD.jpg"
                        : `${post.albumImage as string}`
                    }
                    alt="Two people dancing to music"
                  />
                </div>
                <div className={`${styles.userReview}`}>
                  <div className={`${styles.userHeader}`}>
                    <div>
                      <img
                        className={`${styles.userAvatarImage}`}
                        src="/assets/user-avatar.jpeg"
                        alt="User Avatar"
                      />
                    </div>
                    <div className={`${styles.userHandles}`}>
                      <p
                        className={`${styles.userUsername}`}
                        style={{ color: "black", fontWeight: "bold" }}
                      >
                        {`${post.author.firstName} ${post.author.lastName}`}
                      </p>
                      <a href="" className={`${styles.ListOfPostsA}`}>
                        <span style={{ color: "#0f8deb", fontSize: "0.8rem" }}>
                          {`${post.author.username}`}
                        </span>
                      </a>
                    </div>
                  </div>
                  <p
                    className={`${styles.userUsername}`}
                    style={{
                      fontWeight: "bold",
                      paddingTop: "10px",
                      paddingBottom: "5px",
                    }}
                  >
                    {`${post.artistName} - ${post.albumName}`}
                  </p>
                  <p
                    style={{ color: "#383838", fontWeight: "bold" }}
                    className={`${styles.userUsername} ${styles.withPadding}`}
                  >
                    {`${post.title}`}
                  </p>
                  <p
                    className={`${styles.userUsername}`}
                  >{`${post.content}`}</p>
                  <p
                    className={`${styles.userUsername}`}
                    style={{ paddingBottom: "5px" }}
                  >
                    ⭐️ ⭐️ ⭐️ ⭐️
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section> */}
      {recentPosts && recentPosts.getRecentPosts.hasMore ? (
        <div className={`${styles.seeMoreWrapper} mt-6`}>
          <a
          className="px-8 cursor-pointer py-2.5 bg-brand-orange hover:bg-brand-orange_hover text-white rounded"
            onClick={() => handleFetchMorePosts()}
          >
            Load More
          </a>
        </div>
      ) : null}
    </section>
  );
};
