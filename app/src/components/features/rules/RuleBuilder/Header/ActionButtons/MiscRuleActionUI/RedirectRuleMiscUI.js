import { InfoCircleOutlined } from "@ant-design/icons";
import { Tooltip, Checkbox } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentlySelectedRuleData, getAppMode } from "store/selectors";
import { saveRule } from "../actions";
import { setCurrentlySelectedRule } from "../../../actions";
import featureFlag from "utils/feature-flag";
import APP_CONSTANTS from "config/constants";
import { isDesktopMode } from "utils/AppUtils";

// checkbox to either redirect with 307 or just change the url inside proxy server
const RedirectRuleMiscUI = ({ location }) => {
  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const appMode = useSelector(getAppMode);

  const changePreserveCookieFlag = (preserveCookie) => {
    setCurrentlySelectedRule(dispatch, {
      ...currentlySelectedRuleData,
      preserveCookie,
    });

    const isCreateMode = location.pathname.indexOf("create") !== -1;

    !isCreateMode &&
      saveRule(appMode, null, {
        ...currentlySelectedRuleData,
        preserveCookie,
      });
  };

  const togglePreserveCookie = () => {
    if (currentlySelectedRuleData.preserveCookie) {
      changePreserveCookieFlag(false);
    } else {
      changePreserveCookieFlag(true);
    }
  };

  // return <p>something</p>

  return isDesktopMode() && featureFlag.getValue(APP_CONSTANTS.FEATURES.FEAT_PRESERVE_REDIRECT_COOKIES, true) ? (
    <>
      <Checkbox checked={currentlySelectedRuleData.preserveCookie} onChange={togglePreserveCookie} />
      <span>&nbsp;Preserve Cookie&nbsp;</span>
      <Tooltip title="Will preserve cookies for requests to internal static assets">
        <InfoCircleOutlined />
      </Tooltip>
      &nbsp;
    </>
  ) : null;
};
export default RedirectRuleMiscUI;
