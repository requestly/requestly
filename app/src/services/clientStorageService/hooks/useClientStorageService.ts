import Logger from "lib/logger";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { initClientStorageService } from "..";
import { useEffect } from "react";

let firstInit = false;

const useClientStorageService = () => {
  const appMode = useSelector(getAppMode);

  if (!firstInit) {
    Logger.log("[ClientStorageServiceProvider] firstInit", appMode);
    initClientStorageService(appMode);
    firstInit = true;
  }

  useEffect(() => {
    Logger.log("[ClientStorageServiceProvider] appMode changed", appMode);
    initClientStorageService(appMode);
  }, [appMode]);
};

export default useClientStorageService;
