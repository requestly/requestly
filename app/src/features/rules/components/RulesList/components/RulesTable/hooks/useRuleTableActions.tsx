import { useCallback } from "react";
import { RuleObj, RuleObjStatus } from "features/rules/types/rules";
import { RuleTableDataType } from "../types";
import { useSelector } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { rulesActions } from "store/features/rules/slice";
import { useDispatch } from "react-redux";
import Logger from "lib/logger";
import { StorageService } from "init";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { toast } from "utils/Toast";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { isEmpty } from "lodash";
import RULES_LIST_TABLE_CONSTANTS from "config/constants/sub/rules-list-table-constants";

const useRuleTableActions = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  const handlePin = (rules: RuleTableDataType[]) => {
    console.log("Pinning Rules", { rules });
  };

  const handleStatusToggle = (rules: RuleTableDataType[], checked: boolean) => {
    console.log("handleStatusToggle", { rules, checked });
    // TODO: Add logic to propogate the changes to storageservice;

    rules.forEach((rule) => {
      const status = checked ? RuleObjStatus.ACTIVE : RuleObjStatus.INACTIVE;
      changeRuleStatus(status, rule);
    });
  };

  const changeRuleStatus = (newStatus: RuleObjStatus, rule: RuleObj) => {
    // TODO: Handle Group status toggle
    console.log({ rule, user });

    // TODO: Why is this added??
    // if (rule.currentOwner) {
    //   currentOwner = user?.details?.profile?.uid || null;
    // } else {
    //   currentOwner = rule.currentOwner;
    // }
    const updatedRule: RuleObj = {
      ...rule,
      status: newStatus,
    };

    Logger.log("Writing storage in RulesTable changeRuleStatus");
    updateRuleInStorage(updatedRule, rule).then(() => {
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
    });
  };

  const toggleSharingModal = (rule: RuleObj) => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "sharingModal",
        newValue: true,
        newProps: {
          selectedRules: [rule.id],
        },
      })
    );
  };

  const promptUserToSignup = (source: string) => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          src: APP_CONSTANTS.FEATURES.RULES,
          userActionMessage: "Sign up to generate a public shareable link",
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          eventSource: source,
        },
      })
    );
  };

  const handleRuleShare = (rule: RuleObj) => {
    // TODO
    // trackShareButtonClicked("rules_list");
    user.loggedIn ? toggleSharingModal(rule) : promptUserToSignup(AUTH.SOURCE.SHARE_RULES);
  };

  // Generic
  const updateRuleInStorage = async (updatedRule: RuleObj, originalRule: RuleObj) => {
    dispatch(rulesActions.ruleObjUpsert(updatedRule));

    return StorageService(appMode)
      .saveRuleOrGroup(updatedRule, { silentUpdate: true })
      .then((rule) => {
        console.log("Rule updated in Storage Service");
      })
      .catch(() => {
        dispatch(rulesActions.ruleObjUpsert(originalRule));
      });
  };

  const handleDuplicateRuleClick = useCallback(
    (rule: RuleObj) => {
      dispatch(
        rulesActions.toggleRuleModal({
          isActive: true,
          modalName: "duplicateRuleModal",
          props: {
            ruleToDuplicate: rule,
          },
        })
      );
    },
    [dispatch]
  );

  const closeDuplicateRuleModal = useCallback(() => {
    dispatch(
      rulesActions.toggleRuleModal({
        isActive: false,
        modalName: "duplicateRuleModal",
        props: {
          ruleToDuplicate: null,
        },
      })
    );
  }, [dispatch]);

  const handleDeleteRecordClick = (record: RuleObj) => {};

  const handleRenameGroupClick = (group: RuleObj) => {
    console.log({ group });

    dispatch(
      rulesActions.toggleRuleModal({
        modalName: "renameGroupModal",
        isActive: true,
        props: {
          groupId: group.id,
        },
      })
    );
  };

  const closeRenameGroupModal = () => {
    dispatch(rulesActions.toggleRuleModal({ modalName: "renameGroupModal" }));
  };

  const handleChangeRuleGroupClick = (record: RuleObj) => {};

  const ungroupSelectedRules = (selectedRuleIds: string[]) => {
    // @ts-ignore
    const allPromises = [];

    return new Promise((resolve, reject) => {
      if (isEmpty(selectedRuleIds)) {
        reject(new Error("No Rules were Selected"));
      } else {
        Logger.log("Reading storage in RulesTable ungroupSelectedRules");
        StorageService(appMode)
          .getAllRecords()
          .then((allRules) => {
            selectedRuleIds.forEach(async (ruleId) => {
              const updatedRule = {
                ...allRules[ruleId],
                groupId: RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID,
              };
              Logger.log("Writing to storage in RulesTable ungroupSelectedRules");
              allPromises.push(StorageService(appMode).saveRuleOrGroup(updatedRule));
            });

            // @ts-ignore
            Promise.all(allPromises).then(() => resolve());
          });
      }
    });
  };

  const handleUngroupSelectedRulesClick = (selectedRuleIds: string[]) => {
    return ungroupSelectedRules(selectedRuleIds)
      .then(() => {
        // clearSearch();
        // unselectAllRecords(dispatch);
        //Refresh List
        // updateRulesListRefreshPendingStatus(dispatch, isRulesListRefreshPending);
      })
      .then(() => {
        toast.info("Rules Ungrouped");
        // trackRulesUngrouped();
      })
      .catch(() => toast.warn("Please select rules first", { hideProgressBar: true }));
  };

  return {
    handlePin,
    handleStatusToggle,
    handleRuleShare,
    handleDuplicateRuleClick,
    closeDuplicateRuleModal,
    handleDeleteRecordClick,
    closeRenameGroupModal,
    handleRenameGroupClick,
    handleChangeRuleGroupClick,
    ungroupSelectedRules,
    handleUngroupSelectedRulesClick,
  };
};

export default useRuleTableActions;
