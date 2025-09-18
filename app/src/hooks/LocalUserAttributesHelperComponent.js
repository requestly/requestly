import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { getUserAttributes } from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import useGrowthBookIntegration, { GrowthbookExperimentHelperComponent } from "./useGrowthbookIntegration";
import { trackAttr } from "modules/analytics";

const LocalUserAttributesHelperComponent = () => {
  const dispatch = useDispatch();
  const stableDispatch = useCallback(dispatch, [dispatch]);

  const userAttributes = useSelector(getUserAttributes);
  const [isDeviceIdInitialized, setIsDeviceIdInitialized] = useState(false);

  // deviceId generation. Only once
  useEffect(() => {
    if (!userAttributes?.device_id) {
      const deviceId = uuidv4();
      trackAttr("device_id", deviceId);
      // Failsafe in case local module is not initialized yet
      stableDispatch(globalActions.updateUserAttributes({ device_id: deviceId }));
    } else {
      if (!isDeviceIdInitialized) {
        trackAttr("device_id", userAttributes?.device_id);
        // Failsafe in case local module is not initialized yet
        stableDispatch(globalActions.updateUserAttributes({ device_id: userAttributes?.device_id }));
        setIsDeviceIdInitialized(true);
      }
    }
  }, [userAttributes?.device_id, stableDispatch, isDeviceIdInitialized]);

  // sessionId generation. Reset after every refresh
  useEffect(() => {
    const sessionId = uuidv4();
    trackAttr("session_id", sessionId);
    // Failsafe in case local module is not initialized yet
    stableDispatch(globalActions.updateUserAttributes({ session_id: sessionId }));
  }, [stableDispatch]);

  useGrowthBookIntegration();

  return (
    <>
      <GrowthbookExperimentHelperComponent />
    </>
  );
};

export default LocalUserAttributesHelperComponent;
