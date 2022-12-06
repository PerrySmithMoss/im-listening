import React, { useEffect } from "react";
import { useGlobalUIContext } from "../../../context/GlobalUI.context";
import {
  useFilterPostsLazyQuery,
  useGetRecentPostsQuery,
} from "../../../graphql/generated/graphql";
import styles from "./user-posts.module.css";
import { UserPostsCard } from "./UserPostsCard";

interface ListOfUserPostsProps {
}

export const ListOfUserPosts: React.FC<ListOfUserPostsProps> = ({
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
  const { data: recentPosts, error: recentPostsError, loading: loadingRecentPosts } = useGetRecentPostsQuery({
    variables: {
      limit: 6,
      cursor: null,
    },
  });
  const [
    filterPosts,
    { loading: loadingFilteredPosts, data: filteredPosts },
  ] = useFilterPostsLazyQuery();

  const { filterCategories, setFilterCategories } = useGlobalUIContext();

  useEffect(() => {
    if (filterCategories.length > 0) {
      filterPosts({
        variables: {
          limit: 6,
          cursor: null,
          genres: filterCategories,
        },
      });
    }
  }, [filterCategories]);

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
      <div className="grid grid-cols-1 largeTablet:grid-cols-2 gap-6 px-4 sm:px-8 lg:px-16 xl:px-20">
        {filterCategories.length > 0 ? (
          <>
            { !Array.isArray(filteredPosts?.filterPosts.posts) ||
              !filteredPosts?.filterPosts.posts.length ? (
              <div>There are no posts under this genre</div>
            ) : (
              <>
                {filteredPosts?.filterPosts.posts.map((post: any) => (
                  <UserPostsCard key={post.id} post={post} />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            {recentPosts && recentPosts.getRecentPosts.posts.map((post: any) => (
              <UserPostsCard key={post.id} post={post} />
            ))}
          </>
        )}
        {/* {recentPosts.getRecentPosts.posts.map((post: any) => (
          <UserPostsCard key={post.id} post={post} />
        ))} */}
      </div>

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
