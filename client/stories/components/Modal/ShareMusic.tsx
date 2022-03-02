import { ActionIcon, TextInput } from "@mantine/core";
import { PlayIcon, PauseIcon, MagnifyingGlassIcon } from "@modulz/radix-icons";
import React, { useCallback, useEffect, useState } from "react";
import { useGlobalUIContext } from "../../../context/GlobalUI.context";
import { useDebounce } from "../../../hooks/useDebounce";
import { useSpotify } from "../../../hooks/useSpotify";

interface ShareMusicProps {
  songAudio: boolean;
}

const debounce = (func: any, delay: number) => {
  let setTimoutInstance: any;
  return function () {
    const args = arguments;
    if (setTimoutInstance) clearTimeout(setTimoutInstance);
    setTimoutInstance = setTimeout(() => func.apply("", args), delay);
  };
};

export const ShareMusic: React.FC<ShareMusicProps> = ({ songAudio }) => {
  const spotifyAPI = useSpotify();
  const [songInput, setSongInput] = useState("");
  const [songResults, setSongResults] = useState<any>([]);
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

  const func: any = useCallback(
    debounce((string: string) => {
      // console.log("Running debounce", string);
      spotifyAPI
        .searchTracks(string, { limit: 5, market: "GB" })
        .then((res: any) => {
          setSongResults(
            res.body.tracks.items.map((track: any) => {
              return {
                id: track.id,
                artist: track.artists[0],
                title: track.name,
                uri: track.uri,
                albumUrl: track.album.images[0].url,
                popularity: track.popularity,
                previewUrl: track.preview_url,
              };
            })
          );
        });
    }, 1000),
    []
  );
  useEffect(() => {
    songInput && func(songInput);
  }, [songInput]);

  // console.log(songResults);

  const handlePlaySongPreview = (song: any) => {
    console.log("User selected to preview song");
    setIsMusicPlaying(!isMusicPlaying);
    setPlayingTrackState(song.Uri);
    setIsShowMusicPlayerOpen(!isShowMusicPlayerOpen);
    setChosenSong(song);
  };
  return (
    <div className="mt-3">
      <TextInput
        size="md"
        icon={<MagnifyingGlassIcon style={{ height: 22, width: 22 }} />}
        placeholder="Smells Like Teen Spirit"
        label="Song name"
        description="Enter a song name"
        value={songInput}
        onChange={(event) => setSongInput(event.currentTarget.value)}
        required
      />
      <div className="mt-4">
        {songResults.map((song: any) => (
          <div key={song.id} className="flex pb-4">
            {/* <div>
              1
            </div> */}
            <div className="relative">
              <img
                className="w-28 h-auto"
                src={song.albumUrl}
                alt="Album cover art"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
                <a className=" rounded-full p-4">
                  {/* Only show play icon if there is a preview url */}
                  {/* song.uri === playingTrackState &&
                  isMusicPlaying && */}
                  {song.previewUrl !== null && (
                    <>
                      {song.uri === chosenSong.uri && isMusicPlaying ? (
                        <>
                          {songAudio === true ? (
                            <PlayIcon
                              onClick={() => handlePlaySongPreview(song)}
                              className="bg-brand-orange cursor-pointer hover:bg-brand-orange_hover"
                              color="white"
                              style={{
                                height: 35,
                                width: 35,
                                //   backgroundColor: "orange",
                                borderRadius: "50%",
                                padding: 7,
                              }}
                            />
                          ) : (
                            <PauseIcon
                              onClick={() => handlePlaySongPreview(song)}
                              className="bg-brand-orange cursor-pointer hover:bg-brand-orange_hover"
                              color="white"
                              style={{
                                height: 35,
                                width: 35,
                                //   backgroundColor: "orange",
                                borderRadius: "50%",
                                padding: 7,
                              }}
                            />
                          )}
                        </>
                      ) : (
                        <PlayIcon
                          onClick={() => handlePlaySongPreview(song)}
                          className="bg-brand-orange cursor-pointer hover:bg-brand-orange_hover"
                          color="white"
                          style={{
                            height: 35,
                            width: 35,
                            //   backgroundColor: "orange",
                            borderRadius: "50%",
                            padding: 7,
                          }}
                        />
                      )}
                    </>
                  )}
                </a>
              </div>
            </div>
            <div className="pl-3 mt-2 flex w-full">
              <div className="flex w-full">
                <div className="">
                  <h3 className="font-bold">{song.artist.name}</h3>
                  <h3 className=" text-sm">{song.title}</h3>
                  {isShowMusicPlayerOpen && (
                    <div className="pt-4">
                      {playingTrackState === song.uri && (
                        <div className="flex content-center items-center">
                          {/* <div>
                            <audio
                              style={{ height: 35 }}
                              autoPlay
                              controls
                              id="linkAudio"
                            >
                              <source src={songPreviewUrl} type="audio/mpeg" />
                            </audio>
                          </div> */}
                          <div className="">
                            <button className="px-6 py-2 text-white bg-brand-orange hover:bg-brand-orange_hover rounded">
                              Select
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
