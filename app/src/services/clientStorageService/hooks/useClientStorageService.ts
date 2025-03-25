import Logger from "lib/logger";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { initClientStorageService } from "..";
import { useEffect, useRef } from "react";

const useClientStorageService = () => {
  const appMode = useSelector(getAppMode);
  const firstInit = useRef(false);

  if (!firstInit.current) {
    Logger.log("[ClientStorageServiceProvider] firstInit", appMode);
    initClientStorageService(appMode);
    firstInit.current = true;
  }

  useEffect(() => {
    Logger.log("[ClientStorageServiceProvider] appMode changed", appMode);
    initClientStorageService(appMode);
  }, [appMode]);
};

export default useClientStorageService;
