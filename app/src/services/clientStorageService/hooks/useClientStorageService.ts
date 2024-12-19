import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { initClientStorageService } from "..";
import Logger from "lib/logger";

const useClientStorageService = () => {
  const appMode = useSelector(getAppMode);

  useEffect(() => {
    Logger.log("[useClientStorageService]", { appMode });
    initClientStorageService(appMode);
  }, [appMode]);
};

export default useClientStorageService;
