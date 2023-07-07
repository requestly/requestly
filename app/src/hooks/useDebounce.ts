import { useEffect, useRef, useMemo } from "react";
import { debounce } from "lodash";

export const useDebounce = (callback: () => void) => {
  const ref = useRef(null);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };

    return debounce(func, 500);
  }, []);

  return debouncedCallback;
};
