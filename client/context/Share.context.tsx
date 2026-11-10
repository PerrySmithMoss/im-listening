import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { ShareMusic } from "../components/Modal/ShareMusic";
import { GetCurrentUserDocument } from "../graphql/generated/graphql";
import { feedHref, parseGenres } from "../lib/genres";

const ShareContext = createContext({ open: () => {}, signedIn: false, loading: false });

export function ShareProvider({ children }: PropsWithChildren) {
  const [opened, setOpened] = useState(false);
  const { data, loading } = useQuery(GetCurrentUserDocument);
  const user = data?.getCurrentUser;
  const router = useRouter();
  const { isReady, pathname, query, events } = router;

  useEffect(() => {
    const close = (_url: string, { shallow }: { shallow: boolean }) => { if (!shallow) setOpened(false); };
    events.on("routeChangeStart", close);
    return () => events.off("routeChangeStart", close);
  }, [events]);

  useEffect(() => {
    if (!user || !isReady || pathname !== "/" || query.share !== "1") return;
    void router.replace(feedHref(parseGenres(query.genre), false), undefined, { shallow: true, scroll: false })
      .then((navigated) => {
        if (!navigated) return;
        document.getElementById("home-share")?.focus({ preventScroll: true });
        setOpened(true);
      })
      .catch(() => undefined);
  }, [user, isReady, pathname, query.share, query.genre, router]);

  return (
    <ShareContext.Provider value={{ open: () => setOpened(true), signedIn: Boolean(user), loading }}>
      {children}
      {user && <ShareMusic key={user.id} opened={opened} onClose={() => setOpened(false)} />}
    </ShareContext.Provider>
  );
}

export const useShare = () => useContext(ShareContext);
