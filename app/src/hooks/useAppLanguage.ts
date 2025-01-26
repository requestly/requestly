import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAppLanguage } from "store/selectors";
import { globalActions } from "store/slices/global/slice";

export const useAppLanguage = () => {
  const dispatch = useDispatch();
  const currentLanguage = useSelector(getAppLanguage);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newLang = document.documentElement.lang;
      if (newLang !== currentLanguage) {
        dispatch(globalActions.updateAppLanguage(newLang));
      }
    });

    //observing the HTML element for lang attribute changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, [currentLanguage, dispatch]);
};
