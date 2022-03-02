import { useLocalStorageValue } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import SpotifyPlayer from "react-spotify-web-playback";
import { useGlobalUIContext } from "../../../context/GlobalUI.context";

interface PlayerProps {
  trackUri: string;
}

export const Player: React.FC<PlayerProps> = ({ trackUri }) => {
  const [token, setToken] = useLocalStorageValue({
    key: "il-spotify-token",
    defaultValue: "",
  });
  const {
    isMusicPlaying,
    setIsMusicPlaying,
    playingTrackState,
    setPlayingTrackState,
  } = useGlobalUIContext();

  useEffect(() => {
    if (trackUri) {
      setIsMusicPlaying(true);
    }
  }, [trackUri]);
  return (
    <SpotifyPlayer
      styles={{
        activeColor: "#fff",
        bgColor: "#181818",
        color: "#fff",
        loaderColor: "#fff",
        sliderColor: "#1cb954",
        trackArtistColor: "#ccc",
        trackNameColor: "#fff",
        height: "70px",
        sliderTrackColor: "#535353",
        sliderTrackBorderRadius: "4px",
        sliderHandleColor: "#fff",
        errorColor: "#fff",
      }}
      token={token}
      showSaveIcon
      callback={(state) => {
        setIsMusicPlaying(state.isPlaying);
      }}
      play={isMusicPlaying}
      uris={trackUri ? [trackUri] : []}
      magnifySliderOnHover={true}
      autoPlay={true}
    />
  );
};
