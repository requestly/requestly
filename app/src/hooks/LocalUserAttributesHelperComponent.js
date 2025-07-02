import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { getUserAttributes } from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import useGrowthBookIntegration, { GrowthbookExperimentHelperComponent } from "./useGrowthbookIntegration";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";

const LocalUserAttributesHelperComponent = () => {
  const dispatch = useDispatch();
  const stableDispatch = useCallback(dispatch, [dispatch]);

  const userAttributes = useSelector(getUserAttributes);

  // deviceId generation. Only once
  useEffect(() => {
    if (!userAttributes?.deviceId) {
      const deviceId = uuidv4();
      stableDispatch(globalActions.updateUserAttributes({ deviceId }));
    } else {
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.CUSTOM_DEVICE_ID, userAttributes?.deviceId);
    }
  }, [userAttributes?.deviceId, stableDispatch]);

  // sessionId generation. Reset after every refresh
  useEffect(() => {
    const sessionId = uuidv4();
    stableDispatch(globalActions.updateUserAttributes({ sessionId }));
  }, [stableDispatch]);

  useGrowthBookIntegration();

  return (
    <>
      <GrowthbookExperimentHelperComponent />
    </>
  );
};

export default LocalUserAttributesHelperComponent;
