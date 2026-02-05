import { useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@adapters/store/global";
import { getUserAuthDetails } from "@adapters/store/global";
import { getWorkspaceViewSlice } from "@adapters/workspace";
import { setupWorkspaceView } from "@adapters/workspace";

import type { ApiClientLayout, UserAuthDetails } from "../types";

export default function useApiClientLayout(): ApiClientLayout {
  const dispatch = useDispatch<AppDispatch>();
  const user: UserAuthDetails = useSelector(getUserAuthDetails);
  const isSetupDone = useSelector((s: RootState) => getWorkspaceViewSlice(s).isSetupDone);
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

  useEffect(() => {
    const userId = user.details?.profile?.uid;

    const promise = dispatch(
      setupWorkspaceView({
        userId,
      } as { userId?: string })
    );

    return () => {
      promise.abort();
    };
  }, [dispatch, user.details?.profile?.uid]);

  const getSecondPaneMinSize = (): number => {
    return screenWidth < 1440 ? 700 : 800;
  };
  return {
    getSecondPaneMinSize,
    isSetupDone,
  };
}
