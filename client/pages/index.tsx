import { Navbar } from "../stories/components/Navbar/Navbar";
import { Header } from "../stories/components/Home/Header";
import { WeeklyMostPopular } from "../stories/components/Home/WeeklyMostPopular/WeeklyMostPopular";
import { Categories } from "../stories/components/Home/Categories";
import { ListOfUserPosts } from "../stories/components/Home/UserPosts/ListOfUserPosts";
import { Meta } from "../stories/components/Home/Meta";
import { withApollo } from "../lib/withApollo";
import {
  useGetCurrentUserQuery,
  useGetRecentPostsQuery,
} from "../graphql/generated/graphql";
import styles from "../stories/components/Home/user-posts.module.css";
import { isServer } from "../utils/isServer";
import { PromotedArtists } from "../stories/components/Home/PromotedArtists/PromotedArtists";
import { DiscoverNewMusic } from "../stories/components/Home/DiscoverNewMusic/DiscoverNewMusic";
import { useSpotify } from "../hooks/useSpotify";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorageValue } from "@mantine/hooks";
import { Player } from "../stories/components/MusicPlayer/Player";
import { useGlobalUIContext } from "../context/GlobalUI.context";
import { useMantineColorScheme } from "@mantine/core";

const Home = () => {
  const { data: user, loading: userLoading } = useGetCurrentUserQuery({
    skip: isServer(),
  });
  const { data, error, loading } = useGetRecentPostsQuery({
    variables: {
      limit: 6,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const [songAudio, setSongAudio] = useState<boolean>(true);

  const {
    isMusicPlaying,
    setIsMusicPlaying,
    playingTrackState,
    setPlayingTrackState,
    isShowMusicPlayerOpen,
    setIsShowMusicPlayerOpen,
    chosenSong,
    setChosenSong,
  } = useGlobalUIContext();

  const onAudioStateChange = useCallback(
    (e: React.SyntheticEvent<HTMLAudioElement>) => {
      setSongAudio(e.currentTarget.paused);
    },
    []
  );

  if (!loading && !data) {
    return (
      <div>
        <div>Something went wrong while trying to fetch user posts...</div>
        <div>{error?.message}</div>
      </div>
    );
  }
  return (
    <div>
      <Meta
        title={"I'm Listening"}
        keywords={"music, social media, social, share music, music"}
        description={"Share what you're listening to."}
      />
      <Navbar
        primary={true}
        onLogin={() => {}}
        onLogout={() => {}}
        onCreateAccount={() => {}}
        songAudio={songAudio}
      />
      {!user?.getCurrentUser ? (
        <>
          <Header />
          <DiscoverNewMusic />
          <WeeklyMostPopular />
          <PromotedArtists />
        </>
      ) : !data && loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Categories />
          <ListOfUserPosts recentPosts={data} />
        </>
      )}
      {isMusicPlaying && (
        <div className="fixed bottom-0 left-0 right-0 z-[300]">
          {/* <Player trackUri={playingTrackState} /> */}
          <div
            className={
              colorScheme === "dark" ? `bg-[#1d1e30] py-2` : `bg-[#FFFFFF] py-2`
            }
          >
            <div className="flex content-center items-center justify-center space-x-10">
              <div className="pl-4">
                <div className="flex content-center items-center space-x-3">
                  <div>
                    <img
                      className="w-14 h-auto"
                      src={chosenSong.albumUrl}
                      alt="Album cover art"
                    />
                  </div>
                  <div className="">
                    <h3 className="font-medium text-sm">{chosenSong.artist.name}</h3>
                    <h3 className=" text-[12px]">{chosenSong.title}</h3>
                  </div>
                </div>
              </div>
              <div>
                <audio
                  onPause={onAudioStateChange}
                  onPlay={onAudioStateChange}
                  style={{ height: 35, width: 500 }}
                  autoPlay
                  controls
                  id="linkAudio"
                >
                  <source src={chosenSong.previewUrl} type="audio/mpeg" />
                </audio>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withApollo({ ssr: true })(Home);
