import React, { useEffect, useRef } from "react";

export const useOutsideClick = <T = HTMLElement>(
  callback: () => void
): {
  ref: React.MutableRefObject<T>;
} => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const element = ref.current as HTMLElement;

      if (element && !element.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [callback]);

  return { ref };
};
