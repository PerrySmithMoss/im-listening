import React, {
  useState,
  createContext,
  SetStateAction,
  useContext,
} from "react";
import { IChosenSong } from "../interfaces/IChosenSong";

type GlobalUIProps = {
  isMusicPlaying: boolean;
  setIsMusicPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  playingTrackState: string;
  setPlayingTrackState: React.Dispatch<React.SetStateAction<string>>;
  isShowMusicPlayerOpen: boolean;
  setIsShowMusicPlayerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chosenSong: IChosenSong | any,
  setChosenSong: React.Dispatch<React.SetStateAction<IChosenSong | any>>;
  filterCategories: string[]
  setFilterCategories: React.Dispatch<React.SetStateAction<string[]>>
};

const globalUIcontext = createContext<GlobalUIProps>({
  isMusicPlaying: false,
  setIsMusicPlaying: () => {},
  playingTrackState: "",
  setPlayingTrackState: () => {},
  isShowMusicPlayerOpen: false,
  setIsShowMusicPlayerOpen: () => {},
  chosenSong: {} as IChosenSong,
  setChosenSong: () => {},
  filterCategories: [],
  setFilterCategories: () => {},
});

export const GlobalUIProvider = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [playingTrackState, setPlayingTrackState] = useState<string>("");
  const [isShowMusicPlayerOpen, setIsShowMusicPlayerOpen] = useState<boolean>(
    false
  );
  const [chosenSong, setChosenSong] = useState({});
  const [filterCategories, setFilterCategories] = useState<string[]>([]);

  return (
    <globalUIcontext.Provider
      value={{
        isMusicPlaying,
        setIsMusicPlaying,
        playingTrackState,
        setPlayingTrackState,
        isShowMusicPlayerOpen,
        setIsShowMusicPlayerOpen,
        chosenSong,
        setChosenSong,
        filterCategories,
        setFilterCategories
      }}
    >
      {children}
    </globalUIcontext.Provider>
  );
};

// Export useContext Hook.
export function useGlobalUIContext() {
  return useContext(globalUIcontext);
}
