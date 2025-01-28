import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";

export const useAppLanguageObserver = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document) {
        const newLang = document.documentElement.lang;
        dispatch(globalActions.updateAppLanguage(newLang));
      }
    });

    //observing the HTML element for lang attribute changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    return () => observer.disconnect();
  }, [dispatch]);
};
