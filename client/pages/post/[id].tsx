import { useRouter } from "next/dist/client/router";
import React from "react";
import {
  useDeletePostMutation,
  useGetCurrentUserQuery,
  useGetPostQuery,
} from "../../graphql/generated/graphql";
import { withApollo } from "../../lib/withApollo";
import { Meta } from "../../components/Home/Meta";
import { Navbar } from "../../components/Navbar/Navbar";
import styles from "../../components/Home/UserPosts/user-posts.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faStar } from "@fortawesome/free-solid-svg-icons";
import { isServer } from "../../utils/isServer";
import Rating from "react-rating";

const Post = ({}) => {
  const router = useRouter();
  const postId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

  const [deletePost] = useDeletePostMutation();
  const { data, loading, error } = useGetPostQuery({
    skip: postId === -1,
    variables: {
      id: postId,
    },
  });
  const { data: User, loading: UserLoading } = useGetCurrentUserQuery({
    skip: isServer(),
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error {error}</div>;
  }

  if (!data?.getPost) {
    <div>Could not find post...</div>;
  }

  return (
    <div>
      <Meta
        title={`${data?.getPost?.title} | I'm Listening`}
        keywords={"music, social media, social, share music, music"}
        description={"Share what you're listening to."}
      />
      <Navbar
        primary={true}
        onLogin={() => {}}
        onLogout={() => {}}
        onCreateAccount={() => {}}
        songAudio={false}
      />
      <section className={`${styles.individualPostWrapper} px-4 sm:px-8 `}>
        <div key={data?.getPost?.id} className={`${styles.individualPostItem}`}>
            <img
              className={`${styles.albumImage}`}
              src={data?.getPost?.albumImage}
              alt="Two people dancing to music"
            />
          <div className={`${styles.individualUserReview}`}>
            <div className={`${styles.userHeader}`}>
              <div>
                <img
                  className={`${styles.userAvatarImage}`}
                  src={data?.getPost?.author.profile.avatar as string}
                  alt="User Avatar"
                />
              </div>
              <div className={`${styles.userHandles}`}>
                <p
                  className={`${styles.userUsername}`}
                  style={{ color: "slate", fontWeight: "bold" }}
                >
                  {`${data?.getPost?.author.firstName} ${data?.getPost?.author.lastName}`}
                </p>
                <a className={`${styles.ListOfPostsA}`}>
                  <span style={{ color: "#0f8deb", fontSize: "0.8rem" }}>
                    {`${data?.getPost?.author.username}`}
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
              {`${data?.getPost?.artistName} - ${data?.getPost?.albumName}`}
            </p>
            <p
              // style={{ color: "#383838", fontWeight: "bold" }}
              className={`${styles.userUsername} ${styles.withPadding}`}
            >
              {`${data?.getPost?.title}`}
            </p>
            <Rating
              initialRating={data?.getPost?.rating}
              readonly
              fractions={2}
              // placeholderRating={3.5}
              emptySymbol={
                <FontAwesomeIcon size="2x" color="gray" icon={faStar} />
              }
              placeholderSymbol={
                <FontAwesomeIcon size="2x" color="gray" icon={faStar} />
              }
              fullSymbol={
                <FontAwesomeIcon size="2x" color="yellow" icon={faStar} />
              }
            />
            {User?.getCurrentUser?.id === data?.getPost?.author.id ? (
              <div className={`${styles.iconBadgeWrapper}`}>
                <FontAwesomeIcon
                  color="red"
                  icon={faTrash}
                  onClick={async () => {
                    await deletePost({
                      variables: {
                        id: parseInt(data?.getPost?.id!),
                      },
                      update: (cache) => {
                        cache.evict({
                          id: "Post:" + parseInt(data?.getPost?.id!),
                        });
                      },
                    });
                    router.push("/");
                  }}
                  className={`${styles.iconBadgeDelete}`}
                ></FontAwesomeIcon>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default withApollo({ ssr: false })(Post);
