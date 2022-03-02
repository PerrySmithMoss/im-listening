import { useEffect } from "react";

import { debounce } from "../utils/debounce";

export const useDebounce = <A = unknown, R = void>(
  fn: (args: A) => R,
  ms: number
): ((args: A) => Promise<R>) => {
  const [debouncedFun, teardown] = debounce<A, R>(fn, ms);

  useEffect(() => () => teardown(), []);

  return debouncedFun;
};

{/* import React from "react";
import { useEffect } from "react";
import { useState } from "react";

export function useDebounce(
  value: string,
  timeout: number,
  callback: () => void
) {
  const [timer, setTimer] = useState<any | null>(null);

  const clearTimer = () => {
    if (timer) clearTimeout(timer!);
  };

  useEffect(() => {
    clearTimer();

    if (value && callback) {
      const newTimer = setTimeout(callback, timeout);
      setTimer(newTimer);
    }
    return () => clearTimer();
  }, [value]);
} */}
