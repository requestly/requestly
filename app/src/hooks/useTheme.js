import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import APP_CONSTANTS from "config/constants";
import { actions } from "store";
import { getAppTheme } from "store/selectors";

const { THEMES } = APP_CONSTANTS;

const useTheme = () => {
  // Global States
  const dispatch = useDispatch();
  const appTheme = useSelector(getAppTheme);

  // Component State
  const [isInitialSettingsDone, setIsInitialSettingsDone] = useState(false);

  // This useEffect loads up the initial theme
  useEffect(() => {
    if (!isInitialSettingsDone) {
      setIsInitialSettingsDone(true);
      // const newTheme = localStorage.getItem("app-theme") || appTheme; // Initial theme
      const newTheme = THEMES.DARK;
      if (newTheme) {
        dispatch(actions.updateAppTheme({ appTheme: newTheme }));
      }
    }
  }, [appTheme, dispatch, isInitialSettingsDone]);

  // This useEffect is for handing the in-app theme changes + one time change from above useEffect
  useEffect(() => {
    const newTheme = appTheme;
    // Apply new theme
    if (newTheme === THEMES.LIGHT) {
      document.body.classList.remove(THEMES.DARK);
      document.body.classList.add(THEMES.LIGHT);
    }
    if (newTheme === THEMES.DARK) {
      document.body.classList.remove(THEMES.LIGHT);
      document.body.classList.add(THEMES.DARK);
    }
    // localStorage.setItem("app-theme", newTheme);
  }, [appTheme]);
};

export default useTheme;
