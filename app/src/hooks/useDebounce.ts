import { useEffect, useRef, useMemo } from "react";
import { debounce, DebounceSettings } from "lodash";

export const useDebounce = (callback: (...args: any) => void, delay: number = 500, options?: DebounceSettings) => {
  const ref = useRef(null);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = (...args: any[]) => {
      ref.current?.(...args);
    };

    return debounce(func, delay, options);
  }, [delay, options]);

  return debouncedCallback;
};
