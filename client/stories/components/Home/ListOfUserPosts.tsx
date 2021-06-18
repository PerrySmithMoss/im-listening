import React from "react";
import styles from "./user-posts.module.css";
// const KOD = require("../../assets/KOD.jpg") as string;
// const UserAvatar = require("../../assets/user-avatar.jpeg") as string;

interface ListOfUserPostsProps {}

export const ListOfUserPosts: React.FC<ListOfUserPostsProps> = ({}) => {
  return (
    <section className={`${styles.userPostsWrapper}`}>
      <a href="#">
        <div className={`${styles.userPostItem}`}>
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
                  David Henry{" "}
                </p>
                <a href="">
                  <span style={{ color: "#0f8deb", fontSize: "0.8rem" }}>
                    @davidH
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
              J. Cole - KOD
            </p>
            <p
              style={{ color: "#383838", fontWeight: "bold" }}
              className={`${styles.userUsername} ${styles.withPadding}`}
            >
              Cole world!
            </p>
            <p className={`${styles.userUsername}`}>"Loving this new album!"</p>
            <p className={`${styles.userUsername}`} style={{ paddingBottom: "5px" }}>
              ⭐️ ⭐️ ⭐️ ⭐️
            </p>
          </div>
        </div>
      </a>
      <a href="">
        <div className={`${styles.userPostItem}`}>
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
                  David Henry{" "}
                </p>
                <a href="">
                  <span style={{ color: "#0f8deb", fontSize: "0.8rem" }}>
                    @davidH
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
              J. Cole - KOD
            </p>
            <p
              style={{ color: "#383838", fontWeight: "bold" }}
              className={`${styles.userUsername} ${styles.withPadding}`}
            >
              Cole world!
            </p>
            <p className={`${styles.userUsername}`}>"Loving this new album!"</p>
            <p className={`${styles.userUsername}`} style={{ paddingBottom: "5px" }}>
              ⭐️ ⭐️ ⭐️ ⭐️
            </p>
          </div>
        </div>
      </a>
      <a href="#">
        <div className={`${styles.userPostItem}`}>
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
                  David Henry{" "}
                </p>
                <a href="">
                  <span style={{ color: "#0f8deb", fontSize: "0.8rem" }}>
                    @davidH
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
              J. Cole - KOD
            </p>
            <p
              style={{ color: "#383838", fontWeight: "bold" }}
              className={`${styles.userUsername} ${styles.withPadding}`} 
            >
              Cole world!
            </p>
            <p className={`${styles.userUsername}`}>"Loving this new album!"</p>
            <p className={`${styles.userUsername}`} style={{ paddingBottom: "5px" }}>
              ⭐️ ⭐️ ⭐️ ⭐️
            </p>
          </div>
        </div>
      </a>
      <a href="#">
        <div className={`${styles.userPostItem}`}>
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
                  David Henry{" "}
                </p>
                <a href="">
                  <span style={{ color: "#0f8deb", fontSize: "0.8rem" }}>
                    @davidH
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
              J. Cole - KOD
            </p>
            <p
              style={{ color: "#383838", fontWeight: "bold" }}
              className={`${styles.userUsername} ${styles.withPadding}`}
            >
              Cole world!
            </p>
            <p className={`${styles.userUsername}`}>"Loving this new album!"</p>
            <p className={`${styles.userUsername}`} style={{ paddingBottom: "5px" }}>
              ⭐️ ⭐️ ⭐️ ⭐️
            </p>
          </div>
        </div>
      </a>
      <a href="#">
        <div className={`${styles.userPostItem}`}>
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
                  David Henry{" "}
                </p>
                <a href="">
                  <span style={{ color: "#0f8deb", fontSize: "0.8rem" }}>
                    @davidH
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
              J. Cole - KOD
            </p>
            <p
              style={{ color: "#383838", fontWeight: "bold" }}
              className={`${styles.userUsername} ${styles.withPadding}`}
            >
              Cole world!
            </p>
            <p className={`${styles.userUsername}`}>"Loving this new album!"</p>
            <p className={`${styles.userUsername}`} style={{ paddingBottom: "5px" }}>
              ⭐️ ⭐️ ⭐️ ⭐️
            </p>
          </div>
        </div>
      </a>
      <a href="#">
        <div className={`${styles.userPostItem}`}>
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
                  David Henry{" "}
                </p>
                <a href="">
                  <span style={{ color: "#0f8deb", fontSize: "0.8rem" }}>
                    @davidH
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
              J. Cole - KOD
            </p>
            <p
              style={{ color: "#383838", fontWeight: "bold" }}
              className={`${styles.userUsername} ${styles.withPadding}`}
            >
              Cole world!
            </p>
            <p className={`${styles.userUsername}`}>"Loving this new album!"</p>
            <p className={`${styles.userUsername}`} style={{ paddingBottom: "5px" }}>
              ⭐️ ⭐️ ⭐️ ⭐️
            </p>
          </div>
        </div>
      </a>
    </section>
  );
};
