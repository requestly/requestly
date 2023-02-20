import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Switch } from "antd";
import APP_CONSTANTS from "config/constants";
import { actions } from "store";
import { getAppTheme } from "store/selectors";
import { trackDarkModeToggled } from "modules/analytics/events/misc/darkMode";

const { THEMES } = APP_CONSTANTS;

const DarkModeToggle = () => {
  //GLOBAL STATE
  const dispatch = useDispatch();
  const appTheme = useSelector(getAppTheme);

  const toggleDarkMode = () => {
    if (appTheme === THEMES.LIGHT) {
      trackDarkModeToggled(true);
      dispatch(actions.updateAppTheme({ appTheme: THEMES.DARK }));
    } else {
      trackDarkModeToggled(false);
      dispatch(actions.updateAppTheme({ appTheme: THEMES.LIGHT }));
    }
  };

  return (
    <Col className="hp-d-flex-center hp-mr-sm-12 hp-mr-12 hide-element-imp">
      <Switch
        checkedChildren="🌙"
        unCheckedChildren="🌞"
        checked={appTheme === THEMES.LIGHT ? false : true}
        onClick={toggleDarkMode}
      />
    </Col>
  );
};

export default DarkModeToggle;
