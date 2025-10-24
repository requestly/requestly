import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getAuthInitialization } from "../store/selectors";
import removePreloader from "actions/UI/removePreloader";
import Logger from "lib/logger";

const usePreLoadRemover = () => {
  const hasAuthInitialized = useSelector(getAuthInitialization);
  const [isPreLoaderRemoved, setIsPreLoaderRemoved] = useState(false);

  useEffect(() => {
    if (hasAuthInitialized) {
      Logger.timeEnd("AuthHandler-preloader");
      removePreloader();
      setIsPreLoaderRemoved(true);
    }
  }, [hasAuthInitialized]);
  return {
    isPreLoaderRemoved,
  };
};

export default usePreLoadRemover;
