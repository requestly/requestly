import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { isEqual } from "lodash";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { getUserAttributes } from "store/selectors";
import { initGrowthbook, updateGrowthbookAttributes } from "utils/feature-flag/growthbook";
import firebaseApp from "firebase.js";
import { getEmailType } from "utils/mailCheckerUtils";

const useGrowthBookIntegration = () => {
  // Keeping it object as boolean wasn't working when updating attributes
  const [growthbookStatus, setGrowthbookStatus] = useState({ initDone: false });
  const userAttributes = useSelector(getUserAttributes);

  const usePrevious = (value: any) => {
    const ref = useRef(undefined);
    useEffect(() => {
      if (growthbookStatus?.initDone) {
        ref.current = value;
      }
    });
    return ref.current;
  };

  // console.log("gb: LocalUserAttributesHelperComponent");

  const prevUserAttributes = usePrevious(userAttributes);

  useEffect(() => {
    // console.log("gb: userAttributes reference/value changed in redux");
    if (growthbookStatus.initDone) {
      // IMP: Updating this only on after comparing if anything is changed or not. As this was causing rerenders when useFeatureValue is used which then called trackAttr() and causing infinite loops
      // We can only updateGrowthbookAttributes only if deviceId, sessionId, id, email changes in case this happens again.
      if (!isEqual(prevUserAttributes, userAttributes)) {
        // console.log("gb: userAttributes value changed");
        updateGrowthbookAttributes({ ...userAttributes });
      } else {
        // console.log("gb: userAttributes value not changed");
      }
    }
  }, [userAttributes, growthbookStatus, prevUserAttributes]);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, async (user) => {
      setGrowthbookStatus({ initDone: false });
      if (user) {
        const emailType = await getEmailType(user?.email);
        initGrowthbook({ ...user, emailType });
      } else {
        initGrowthbook(user);
      }
      setGrowthbookStatus({ initDone: true });
    });
  }, []);
};

// This is used to prevent rerenders in `useGrowthBookIntegration` when `updateGrowthbookAttributes` is called since it triggers useFeatureValue change.
export const GrowthbookExperimentHelperComponent = (): any => {
  // Fire experiment_assigned as soon as ui loads
  // console.log("gb: GrowthbookExperimentHelperComponent");
  useFeatureValue("backgates_restriction", false);
  useFeatureValue("trial_days_duration", 7);
  return null;
};

export default useGrowthBookIntegration;
