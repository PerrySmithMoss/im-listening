import { useEffect, useState } from "react";

export function useCooldown(seconds: number) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!remaining) return;
    const timer = setTimeout(() => setRemaining(remaining - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);
  return { remaining, start: () => setRemaining(seconds) };
}
