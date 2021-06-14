import React from "react";
import "./user-posts.css";
const KOD = require("../../assets/KOD.jpg") as string;
const UserAvatar = require("../../assets/user-avatar.jpeg") as string;

interface ListOfUserPostsProps {}

export const ListOfUserPosts: React.FC<ListOfUserPostsProps> = ({}) => {
  return (
    <section className="user-posts_wrapper">
      <a href="#">
        <div className="user-post_item">
          <div>
            <img
              className="album-image"
              src={KOD}
              alt="Two people dancing to music"
            />
          </div>
          <div className="user-review">
            <div className="user-header">
              <div>
                <img
                  className="user-avatar_image"
                  src={UserAvatar}
                  alt="User Avatar"
                />
              </div>
              <div className="user-handles">
                <p
                  className="user-username"
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
              className="user-username"
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
              className="user-username"
            >
              Cole world!
            </p>
            <p className="user-username">"Loving this new album!"</p>
            <p className="user-username" style={{ paddingBottom: "5px" }}>
              ⭐️ ⭐️ ⭐️ ⭐️
            </p>
          </div>
        </div>
      </a>
      <a href="">
        <div className="user-post_item">
          <div>
            <img
              className="album-image"
              src={KOD}
              alt="Two people dancing to music"
            />
          </div>
          <div className="user-review">
            <div className="user-header">
              <div>
                <img
                  className="user-avatar_image"
                  src={UserAvatar}
                  alt="User Avatar"
                />
              </div>
              <div className="user-handles">
                <p
                  className="user-username"
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
              className="user-username"
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
              className="user-username"
            >
              Cole world!
            </p>
            <p className="user-username">"Loving this new album!"</p>
            <p className="user-username" style={{ paddingBottom: "5px" }}>
              ⭐️ ⭐️ ⭐️ ⭐️
            </p>
          </div>
        </div>
      </a>
      <a href="#">
        <div className="user-post_item">
          <div>
            <img
              className="album-image"
              src={KOD}
              alt="Two people dancing to music"
            />
          </div>
          <div className="user-review">
            <div className="user-header">
              <div>
                <img
                  className="user-avatar_image"
                  src={UserAvatar}
                  alt="User Avatar"
                />
              </div>
              <div className="user-handles">
                <p
                  className="user-username"
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
              className="user-username"
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
              className="user-username"
            >
              Cole world!
            </p>
            <p className="user-username">"Loving this new album!"</p>
            <p className="user-username" style={{ paddingBottom: "5px" }}>
              ⭐️ ⭐️ ⭐️ ⭐️
            </p>
          </div>
        </div>
      </a>
      <a href="#">
        <div className="user-post_item">
          <div>
            <img
              className="album-image"
              src={KOD}
              alt="Two people dancing to music"
            />
          </div>
          <div className="user-review">
            <div className="user-header">
              <div>
                <img
                  className="user-avatar_image"
                  src={UserAvatar}
                  alt="User Avatar"
                />
              </div>
              <div className="user-handles">
                <p
                  className="user-username"
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
              className="user-username"
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
              className="user-username"
            >
              Cole world!
            </p>
            <p className="user-username">"Loving this new album!"</p>
            <p className="user-username" style={{ paddingBottom: "5px" }}>
              ⭐️ ⭐️ ⭐️ ⭐️
            </p>
          </div>
        </div>
      </a>
      <a href="#">
        <div className="user-post_item">
          <div>
            <img
              className="album-image"
              src={KOD}
              alt="Two people dancing to music"
            />
          </div>
          <div className="user-review">
            <div className="user-header">
              <div>
                <img
                  className="user-avatar_image"
                  src={UserAvatar}
                  alt="User Avatar"
                />
              </div>
              <div className="user-handles">
                <p
                  className="user-username"
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
              className="user-username"
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
              className="user-username"
            >
              Cole world!
            </p>
            <p className="user-username">"Loving this new album!"</p>
            <p className="user-username" style={{ paddingBottom: "5px" }}>
              ⭐️ ⭐️ ⭐️ ⭐️
            </p>
          </div>
        </div>
      </a>
      <a href="#">
        <div className="user-post_item">
          <div>
            <img
              className="album-image"
              src={KOD}
              alt="Two people dancing to music"
            />
          </div>
          <div className="user-review">
            <div className="user-header">
              <div>
                <img
                  className="user-avatar_image"
                  src={UserAvatar}
                  alt="User Avatar"
                />
              </div>
              <div className="user-handles">
                <p
                  className="user-username"
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
              className="user-username"
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
              className="user-username"
            >
              Cole world!
            </p>
            <p className="user-username">"Loving this new album!"</p>
            <p className="user-username" style={{ paddingBottom: "5px" }}>
              ⭐️ ⭐️ ⭐️ ⭐️
            </p>
          </div>
        </div>
      </a>
    </section>
  );
};
