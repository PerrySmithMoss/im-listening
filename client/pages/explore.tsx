import { Navbar } from "../components/Navbar/Navbar";
import { Categories } from "../components/Home/Categories";
import { ListOfUserPosts } from "../components/Home/UserPosts/ListOfUserPosts";
import { Meta } from "../components/Home/Meta";
import { withApollo } from "../lib/withApollo";
import {
  useGetRecentPostsQuery,
} from "../graphql/generated/graphql";
import { useCallback, useState } from "react";
import { useGlobalUIContext } from "../context/GlobalUI.context";
import { useMantineColorScheme } from "@mantine/core";

const Explore = () => {

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
    chosenSong,
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
        title={"Explore | I'm Listening"}
        keywords={"music, social media, social, share music, music"}
        description={"See what music people are listening to."}
      />
      <Navbar
        primary={true}
        onLogin={() => {}}
        onLogout={() => {}}
        onCreateAccount={() => {}}
        songAudio={songAudio}
      />

      <Categories />
      <ListOfUserPosts />

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
                    <h3 className="font-medium text-sm">
                      {chosenSong.artist.name}
                    </h3>
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

export default withApollo({ ssr: true })(Explore);
