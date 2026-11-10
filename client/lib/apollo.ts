import { ApolloClient, HttpLink, InMemoryCache, type NormalizedCacheObject, type FieldMergeFunction, type Reference, type StoreObject } from "@apollo/client";

export const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL ?? "http://localhost:5050/graphql";

type PostPage = { posts: readonly (StoreObject | Reference)[]; hasMore: boolean };
const mergePage: FieldMergeFunction<PostPage> = (existing, incoming, { args, readField }) => {
  if (!args?.cursor || !existing) return incoming;
  const seen = new Set(existing.posts.map((post) => readField("id", post)));
  return {
    ...incoming,
    posts: [...existing.posts, ...incoming.posts.filter((post) => !seen.has(readField("id", post)))],
  };
};

export function createApolloClient(initialState?: NormalizedCacheObject, ssrMode = false) {
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getRecentPosts: { keyArgs: false, merge: mergePage },
          filterPosts: { keyArgs: ["genres"], merge: mergePage },
        },
      },
    },
  });
  if (initialState) cache.restore(initialState);
  return new ApolloClient({
    ssrMode,
    cache,
    link: new HttpLink({
      uri: ssrMode ? process.env.GRAPHQL_INTERNAL_URL ?? graphqlUrl : graphqlUrl,
      credentials: ssrMode ? "omit" : "include",
      ...(ssrMode && { fetch: (url: RequestInfo | URL, options?: RequestInit) =>
        fetch(url, { ...options, signal: AbortSignal.timeout(3000) }) }),
    }),
  });
}
