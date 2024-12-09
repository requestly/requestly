import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import { getUserAttributes } from "store/selectors";
import { globalActions } from "store/slices/global/slice";
import useGrowthBookIntegration, { GrowthbookExperimentHelperComponent } from "./useGrowthbookIntegration";

const LocalUserAttributesHelperComponent = () => {
  const dispatch = useDispatch();
  const stableDispatch = useCallback(dispatch, [dispatch]);

  const userAttributes = useSelector(getUserAttributes);

  // deviceId generation. Only once
  useEffect(() => {
    if (!userAttributes?.deviceId) {
      const deviceId = uuidv4();
      stableDispatch(globalActions.updateUserAttributes({ deviceId }));
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
