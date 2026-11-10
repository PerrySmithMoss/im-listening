import { createContext, useContext, useState, type Dispatch, type PropsWithChildren, type SetStateAction } from "react";

type GlobalUIState = {
  filterCategories: string[];
  setFilterCategories: Dispatch<SetStateAction<string[]>>;
};

const GlobalUIContext = createContext<GlobalUIState | null>(null);

export function GlobalUIProvider({ children }: PropsWithChildren) {
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  return (
    <GlobalUIContext.Provider value={{ filterCategories, setFilterCategories }}>
      {children}
    </GlobalUIContext.Provider>
  );
}

export function useGlobalUIContext() {
  const context = useContext(GlobalUIContext);
  if (!context) throw new Error("Global UI provider is missing");
  return context;
}
