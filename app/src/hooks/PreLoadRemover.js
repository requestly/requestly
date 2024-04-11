import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getAuthInitialization } from "../store/selectors";
import removePreloader from "actions/UI/removePreloader";
import Logger from "lib/logger";

const PreLoadRemover = () => {
  const hasAuthInitialized = useSelector(getAuthInitialization);

  useEffect(() => {
    if (hasAuthInitialized) {
      Logger.timeEnd("AuthHandler-preloader");
      removePreloader();
    }
  }, [hasAuthInitialized]);
  return null;
};

export default PreLoadRemover;
