import {
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Avatar,
  Button,
  Divider,
  Group,
  Stepper,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { PlayIcon, PauseIcon, MagnifyingGlassIcon } from "@modulz/radix-icons";
import { useRouter } from "next/dist/client/router";
import React, { useCallback, useEffect, useState } from "react";
import { useGlobalUIContext } from "../../context/GlobalUI.context";
import {
  useCreatePostMutation,
  useGetCurrentUserQuery,
} from "../../graphql/generated/graphql";
import { useSpotify } from "../../hooks/useSpotify";
import { debounce } from "../../utils/debounce";
import { isServer } from "../../utils/isServer";
import { RatingComp } from "../Rating/Rating";
import { useNotifications } from "@mantine/notifications";
import { useLocalStorageValue } from "@mantine/hooks";
import { getLastWordOfString as getLastWordOfString } from "../../helpers/getLastWordOfString";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import { faSmile } from "@fortawesome/free-regular-svg-icons";

interface ShareMusicProps {
  handleCloseModal: () => void;
  songAudio: boolean;
}

export const ShareMusic: React.FC<ShareMusicProps> = ({
  songAudio,
  handleCloseModal,
}) => {
  const spotifyAPI = useSpotify();
  const notifications = useNotifications();
  const [songInput, setSongInput] = useState("");
  const [chosenSongModalFinal, setChosenSongModalFinal] = useState<any>({});
  const [
    chosenSongArtistGenresModalFinal,
    setChosenSongArtistGenresModalFinal,
  ] = useState<string[]>([]);
  const [chosenSongRating, setChosenSongRating] = useState<number | undefined>(
    undefined
  );
  const [token, setToken] = useLocalStorageValue({
    key: "il-spotify-token",
    defaultValue: "",
  });
  const [chosenSongTitle, setChosenSongTitle] = useState("");
  const [serverDataIsCorrect, setServerDataIsCorrect] = useState(false);
  const { data, loading } = useGetCurrentUserQuery({ skip: isServer() });
  const [createPost] = useCreatePostMutation();
  const [songResults, setSongResults] = useState<any>([]);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [showEmojis, setShowEmojis] = useState(false);
  const nextStep = () =>
    setActive((current) => (current < 1 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));
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
  const fetchSongs: any = useCallback(
    debounce(async (string: string) => {
      // try {
      // const res = await spotifyAPI.searchTracks(string, { limit: 5, market: "GB" })
      // // console.log("Res: ", res)
      // } catch(e) {
      //   console.error("Error: ", e)
      // }

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
        })
        .catch((error: any) => {
          console.error("Error: ", error.statusCode);
          if (error.status === 401 || 403) {
            console.log("You need to refresh your access token!!");
            const fetchSpotifyToken = async (callback: any) => {
              console.log("Fetching new token...");
              // const token = spotifyAPI.getAccessToken()

              const res = await fetch(
                "https://accounts.spotify.com/api/token",
                {
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization:
                      "Basic " +
                      btoa(
                        process.env.NEXT_PUBLIC_CLIENT_ID +
                          ":" +
                          process.env.NEXT_PUBLIC_CLIENT_SECRET
                      ),
                  },
                  method: "POST",
                  body: "grant_type=client_credentials",
                }
              );
              const data = await res.json();
              setToken(data.access_token);
              spotifyAPI.setAccessToken(data.access_token);
              callback();
            };
            fetchSpotifyToken(async () => {
              await spotifyAPI
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
            });
          }
        });
    }, 1000),
    []
  );
  useEffect(() => {
    songInput && fetchSongs(songInput);
  }, [songInput]);

  const fetchArtistGenres: any = useCallback(
    debounce(async (string: string) => {
      spotifyAPI
        .getArtist(string)
        .then((res: any) => {
          setChosenSongArtistGenresModalFinal(res.body.genres);
        })
        .catch((error: any) => {
          console.error("Error: ", error.statusCode);
          if (error.status === 401 || 403) {
            console.log("You need to refresh your access token!!");
            const fetchSpotifyToken = async (callback: any) => {
              console.log("Fetching new token...");
              // const token = spotifyAPI.getAccessToken()

              const res = await fetch(
                "https://accounts.spotify.com/api/token",
                {
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization:
                      "Basic " +
                      btoa(
                        process.env.NEXT_PUBLIC_CLIENT_ID +
                          ":" +
                          process.env.NEXT_PUBLIC_CLIENT_SECRET
                      ),
                  },
                  method: "POST",
                  body: "grant_type=client_credentials",
                }
              );
              const data = await res.json();
              setToken(data.access_token);
              spotifyAPI.setAccessToken(data.access_token);
              callback();
            };
            fetchSpotifyToken(async () => {
              await spotifyAPI.getArtist(string).then((res: any) => {
                console.log(res);
                setChosenSongArtistGenresModalFinal(res.body.genres);
              });
            });
          }
        });
    }, 1500),
    []
  );
  useEffect(() => {
    Object.keys(chosenSongModalFinal).length !== 0 &&
      fetchArtistGenres(chosenSongModalFinal.artist.id);
  }, [chosenSongModalFinal]);

  const handlePlaySongPreview = (song: any) => {
    setIsMusicPlaying(!isMusicPlaying);
    setPlayingTrackState(song.Uri);
    setIsShowMusicPlayerOpen(!isShowMusicPlayerOpen);
    setChosenSong(song);
  };

  const takeFirstSongGenre = (string: string) => {
    const regexp = /[a-zA-Z]+\s+[a-zA-Z]+/g;
    if (regexp.test(string)) {
      // at least 2 words consisting of letters
      return getLastWordOfString(string);
    } else if (string === "electro") {
      return "electronic";
    } else {
      // one word
      return string.trim();
    }
  };

  const handleSelectedChosenSongFnal = (song: any) => {
    setChosenSongModalFinal(song);
  };

  const handleShareMusic = async (event: any) => {
    event.preventDefault();
    // setErrors(validation(formValues));
    // if (dataIsCorrect === true) {
    const res = await createPost({
      variables: {
        artistName: chosenSongModalFinal.artist.name,
        albumName: chosenSongModalFinal.title,
        title: chosenSongTitle,
        previewSongUrl: chosenSongModalFinal.previewUrl,
        genres: chosenSongArtistGenresModalFinal,
        genre: takeFirstSongGenre(chosenSongArtistGenresModalFinal[0]),
        rating: chosenSongRating as number,
        albumImage: chosenSongModalFinal.albumUrl,
      },
      update: (cache) => {
        cache.evict({ fieldName: "getRecentPosts:{}" });
      },
    });
    if (res.errors) {
      console.log(res.errors);
      setServerDataIsCorrect(false);
      // setServerErrors(toErrorMap(res.data.registerUser.errors));
      // } else if (res.data?.registerUser.user) {
      //   router.push("/");
    } else {
      setServerDataIsCorrect(true);
      handleCloseModal();
      notifications.showNotification({
        title: "Success",
        message: "Your post was successfully uploaded.",
        icon: <FontAwesomeIcon size="2x" color="white" icon={faCheckCircle} />,
        color: "teal",
      });
      router.push("/");
    }
  };

  const addEmoji = (e: any) => {
    let sym = e.unified.split("-");
    let codesArray: any = [];
    sym.forEach((el: any) => codesArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codesArray);
    setChosenSongTitle(chosenSongTitle + emoji);
  };

  return (
    <div className="mt-6">
      <>
        <Stepper
          active={active}
          onStepClick={setActive}
          breakpoint="sm"
          color="orange"
        >
          <Stepper.Step label="Find song" allowStepSelect={active > 0}>
            {/* <div className="py-3">
            <hr />
            </div> */}
            <div className="mt-1 pl-1">
              <TextInput
                size="sm"
                icon={<MagnifyingGlassIcon style={{ height: 22, width: 22 }} />}
                placeholder="Smells Like Teen Spirit"
                label="Song name"
                description="Enter a song name"
                value={songInput}
                onChange={(event) => setSongInput(event.currentTarget.value)}
                required
              />
              <div className="">
                {songResults.map((song: any) => (
                  <div key={song.id}>
                    <div key={song.id} className="flex py-4">
                      {/* <div>
              1
            </div> */}
                      <div
                        onClick={() => handleSelectedChosenSongFnal(song)}
                        className={
                          chosenSongModalFinal.id === song.id
                            ? colorScheme === "dark"
                              ? `flex w-full cursor-pointer bg-[#2b2c3d] border border-green-500`
                              : `flex w-full cursor-pointer bg-gray-200 border border-green-500`
                            : colorScheme === "dark"
                            ? `flex w-full cursor-pointer hover:bg-[#2b2c3d]`
                            : `flex w-full cursor-pointer hover:hover:bg-gray-200`
                        }
                      >
                        <div className="relative">
                          <img
                            className="w-32 h-auto"
                            src={song.albumUrl}
                            alt="Album cover art"
                          />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
                            <a className=" rounded-full p-3">
                              {song.previewUrl !== null && (
                                <>
                                  {song.uri === chosenSong.uri &&
                                  isMusicPlaying ? (
                                    <>
                                      {songAudio === true ? (
                                        <PlayIcon
                                          onClick={() =>
                                            handlePlaySongPreview(song)
                                          }
                                          className="bg-brand-orange cursor-pointer hover:bg-brand-orange_hover"
                                          color="white"
                                          style={{
                                            height: 34,
                                            width: 34,
                                            //   backgroundColor: "orange",
                                            borderRadius: "50%",
                                            padding: 5,
                                          }}
                                        />
                                      ) : (
                                        <PauseIcon
                                          onClick={() =>
                                            handlePlaySongPreview(song)
                                          }
                                          className="bg-brand-orange cursor-pointer hover:bg-brand-orange_hover"
                                          color="white"
                                          style={{
                                            height: 34,
                                            width: 34,
                                            //   backgroundColor: "orange",
                                            borderRadius: "50%",
                                            padding: 5,
                                          }}
                                        />
                                      )}
                                    </>
                                  ) : (
                                    <PlayIcon
                                      onClick={() =>
                                        handlePlaySongPreview(song)
                                      }
                                      className="bg-brand-orange cursor-pointer hover:bg-brand-orange_hover"
                                      color="white"
                                      style={{
                                        height: 34,
                                        width: 34,
                                        //   backgroundColor: "orange",
                                        borderRadius: "50%",
                                        padding: 5,
                                      }}
                                    />
                                  )}
                                </>
                              )}
                            </a>
                          </div>
                        </div>
                        <div className="pl-3 flex w-full content-center items-center">
                          <div className="flex w-full justify-between content-center items-center">
                            <div className="">
                              <h3 className="font-bold">{song.artist.name}</h3>
                              <h3 className=" text-sm">{song.title}</h3>
                            </div>
                            {chosenSongModalFinal.id === song.id && (
                              <div className="mr-4">
                                <button className="text-green-500 text-sm bg-transparent">
                                  Selected
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Divider />
                  </div>
                ))}
              </div>
            </div>
          </Stepper.Step>
          <Stepper.Step label="Rate song" allowStepSelect={active > 1}>
            <div className="p-2.5">
              {/* <Text>Chosen Song</Text> */}
              <div className="flex w-full mt-2">
                <div className="relative">
                  <img
                    className="w-28 h-auto"
                    src={chosenSongModalFinal?.albumUrl}
                    alt="Album cover art"
                  />
                </div>
                <div className="pl-3 flex w-full content-center items-center">
                  <div className="flex w-full justify-between content-center items-center">
                    {chosenSongModalFinal?.artist?.name && (
                      <div className="">
                        <h3 className="font-bold">
                          {chosenSongModalFinal.artist.name}
                        </h3>
                        <h3 className=" text-sm">
                          {chosenSongModalFinal.title}
                        </h3>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <hr />
              </div>
              <div className="mt-2">
                <Text style={{ fontWeight: "bold", fontSize: "16px" }}>
                  Write your review
                </Text>
              </div>
              <div className="flex w-full mt-2">
                <div className="relative">
                  <Avatar
                    size={40}
                    radius="xl"
                    src={data?.getCurrentUser?.profile?.avatar as string}
                  />
                </div>
                <div className="pl-3 mt-1 flex w-full content-center items-center">
                  <div className="flex w-full justify-between content-center items-center">
                    {chosenSongModalFinal?.artist?.name && (
                      <div className="w-full">
                        <div className="flex content-center items-center space-x-1">
                          <TextInput
                            value={chosenSongTitle}
                            onChange={(e) =>
                              setChosenSongTitle(e.currentTarget.value)
                            }
                            className="w-full"
                            placeholder="This is my jam!"
                            required
                          />
                          <div>
                            <FontAwesomeIcon
                              onClick={() => setShowEmojis(!showEmojis)}
                              size="2x"
                              color="gray"
                              icon={faSmile}
                              className="cursor-pointer pl-1"
                            />

                            <>
                              {showEmojis && (
                                <Picker
                                  onSelect={(e) => addEmoji(e)}
                                  style={{
                                    position: "absolute",
                                    marginTop: "40px",
                                    marginLeft: -30,
                                    maxWidth: "320px",
                                    borderRadius: "20px",
                                  }}
                                  theme={colorScheme}
                                />
                              )}
                            </>
                          </div>
                        </div>
                        <div className="mt-4">
                          <RatingComp
                            chosenSongRating={chosenSongRating}
                            setChosenSongRating={setChosenSongRating}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Stepper.Step>
          <Stepper.Completed>
            Completed, click back button to get to previous step
          </Stepper.Completed>
        </Stepper>

        <Group position="center" mt="xl">
          <Button disabled={active === 0} variant="default" onClick={prevStep}>
            Back
          </Button>
          <Button
            disabled={Object.keys(chosenSongModalFinal).length === 0}
            onClick={active === 1 ? handleShareMusic : nextStep}
          >
            {active === 1 ? <span>Post</span> : <span>Next step</span>}
          </Button>
        </Group>
      </>
    </div>
  );
};
