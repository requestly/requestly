import { useEffect, useState } from "react";
import removePreloader from "actions/UI/removePreloader";
import Logger from "lib/logger";

const usePreLoadRemover = () => {
  const [isPreLoaderRemoved, setIsPreLoaderRemoved] = useState(false);

  useEffect(() => {
    // Remove preloader early - don't wait for auth
    // Auth can continue initializing in background
    const timer = setTimeout(() => {
      Logger.log("Removing preloader early for better UX");
      removePreloader();
      setIsPreLoaderRemoved(true);
    }, 500); // Small delay to ensure React has rendered

    return () => clearTimeout(timer);
  }, []);

  return {
    isPreLoaderRemoved,
  };
};

export default usePreLoadRemover;
