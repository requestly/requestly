import { useEffect, useRef, useMemo } from "react";
import { debounce } from "lodash";

export const useDebounce = (callback: () => void, delay: number = 500) => {
  const ref = useRef(null);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = (...args: any[]) => {
      ref.current?.(...args);
    };

    return debounce(func, delay);
  }, [delay]);

  return debouncedCallback;
};
