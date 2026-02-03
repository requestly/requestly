import { useLayoutEffect, useState } from "react";

interface ApiClientLayout {
  getSecondPaneMinSize: () => number;
}

export default function useApiClientLayout(): ApiClientLayout {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  useLayoutEffect(() => {
    const handleResize = (): void => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const getSecondPaneMinSize = (): number => {
    return screenWidth < 1440 ? 700 : 800;
  };
  return {
    getSecondPaneMinSize,
  };
}
