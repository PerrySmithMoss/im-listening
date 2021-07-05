import Link from "next/link";
import React from "react";
import { useGetRecentPostsQuery } from "../../../graphql/generated/graphql";
import styles from "./user-posts.module.css";
// const KOD = require("../../assets/KOD.jpg") as string;
// const UserAvatar = require("../../assets/user-avatar.jpeg") as string;

interface ListOfUserPostsProps {
  recentPosts: any;
}

export const ListOfUserPosts: React.FC<ListOfUserPostsProps> = ({
  recentPosts,
}) => {
  return (
    <>
      <section className={`${styles.userPostsWrapper}`}>
        {recentPosts.getRecentPosts.posts.map((post: any) => (
          <Link href="/post/[id]" as={`/post/${post.id}`}>
            <a href="" className={`${styles.ListOfPostsA}`}>
              <div key={post.id} className={`${styles.userPostItem}`}>
                <div>
                  <img
                    className={`${styles.albumImage}`}
                    src="/assets/KOD.jpg"
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
            </a>
          </Link>
        ))}
      </section>
    </>
  );
};
