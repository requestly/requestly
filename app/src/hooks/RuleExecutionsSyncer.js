import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { StorageService } from "init";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import firebaseApp from "../firebase";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { trackRuleExecuted } from "modules/analytics/events/common/rules";
import Logger from "lib/logger";

const RuleExecutionsSyncer = () => {
  //Global State
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  const writeStuffToDB = async (MM, YYYY, count) => {
    if (user?.details?.profile?.uid) {
      const uid = user.details.profile.uid;
      const db = getFirestore(firebaseApp);

      const docRef = doc(db, "rule_execution_metrics", uid, YYYY.toString(), MM.toString());

      if (count) setDoc(docRef, count);
    }
  };

  const stableWriteStuffToDB = useCallback(writeStuffToDB, [user?.details?.profile?.uid]);

  const sendAsAttribute = (data, YYYY, MM) => {
    for (const ruleType in data) {
      const attrName = ruleType.toLowerCase() + "_executions_" + YYYY.toString() + "_" + MM.toString();
      const attrValue = data[ruleType];

      submitAttrUtil(attrName, attrValue);
    }
  };

  const trackRuleExecutions = useCallback((data, YYYY, MM) => {
    for (const ruleType in data) {
      trackRuleExecuted(ruleType, data[ruleType], MM, YYYY);
    }
  }, []);

  useEffect(() => {
    Logger.log("Reading storage in useRuleExecutionsSyncer");
    StorageService(appMode)
      .getRecord("ec")
      .then((storageEC) => {
        if (storageEC) {
          const current = new Date();

          // Consideration: A user would open up Rules Table at-least once in two months period.
          const currentMM = current.getMonth() + 1;
          const currentYYYY = current.getFullYear();
          current.setMonth(current.getMonth() - 1);
          const prevMM = current.getMonth() + 1;
          const prevYYYY = current.getFullYear();

          if (user?.loggedIn) {
            if (storageEC?.[currentYYYY]?.[currentMM]) {
              sendAsAttribute(storageEC?.[currentYYYY]?.[currentMM], currentYYYY, currentMM);
              stableWriteStuffToDB(currentMM, currentYYYY, storageEC[currentYYYY][currentMM]);
            }
            if (storageEC?.[prevYYYY]?.[prevMM]) {
              sendAsAttribute(storageEC?.[prevYYYY]?.[prevMM], prevYYYY, prevMM);
              stableWriteStuffToDB(prevMM, prevYYYY, storageEC[prevYYYY][prevMM]);
            }
          }
          trackRuleExecutions(storageEC?.[currentYYYY]?.[currentMM], currentYYYY, currentMM);
        }
      });
  }, [appMode, stableWriteStuffToDB, trackRuleExecutions, user?.loggedIn]);

  return null;
};

export default RuleExecutionsSyncer;
