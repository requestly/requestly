import { RuleObj } from "features/rules/types/rules";
import { RuleTableDataType } from "../types";
import { useSelector } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { rulesActions } from "store/features/rules/slice";
import { useDispatch } from "react-redux";
import Logger from "lib/logger";
import { StorageService } from "init";

import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { toast } from "utils/Toast";

const useRuleTableActions = () => {
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const dispatch = useDispatch();

  const handlePin = (rules: RuleTableDataType[]) => {
    console.log("Pinning Rules", { rules });
  };

  const handleStatusToggle = (rules: RuleTableDataType[], checked: boolean) => {
    console.log("handleStatusToggle", { rules, checked });
    // TODO: Add logic to propogate the changes to storageservice;

    rules.forEach((rule) => {
      const status = checked ? "Active" : "Inactive";
      changeRuleStatus(status, rule);
    });
  };

  const changeRuleStatus = (newStatus: string, rule: RuleObj) => {
    let currentOwner;

    if (rule.currentOwner) {
      currentOwner = user?.details?.profile?.uid || null;
    } else {
      currentOwner = rule.currentOwner;
    }
    const updatedRule = {
      ...rule,
      currentOwner,
      status: newStatus,
    };

    dispatch(rulesActions.ruleObjUpsert(updatedRule));
    Logger.log("Writing storage in RulesTable changeRuleStatus");
    StorageService(appMode)
      .saveRuleOrGroup(updatedRule, { silentUpdate: true })
      .then((rule) => {
        //Push Notify
        newStatus === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE
          ? toast.success(`Rule is now ${newStatus.toLowerCase()}`)
          : toast.success(`Rule is now ${newStatus.toLowerCase()}`);

        // TODO: Add Analytics
        //Analytics
        // if (newStatus.toLowerCase() === "active") {
        //   trackRQLastActivity("rule_activated");
        //   trackRuleActivatedStatusEvent(rule.ruleType);
        // } else {
        //   trackRQLastActivity("rule_deactivated");
        //   trackRuleDeactivatedStatus(rule.ruleType);
        // }
      })
      .catch(() => {
        dispatch(rulesActions.ruleObjUpsert(rule));
      });
  };

  return { handlePin, handleStatusToggle };
};

export default useRuleTableActions;
