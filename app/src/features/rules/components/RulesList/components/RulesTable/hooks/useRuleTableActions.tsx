import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RuleObj, RuleObjStatus } from "features/rules/types/rules";
import { RuleTableDataType } from "../types";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { rulesActions } from "store/features/rules/slice";
import Logger from "lib/logger";
import { StorageService } from "init";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { toast } from "utils/Toast";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import RULES_LIST_TABLE_CONSTANTS from "config/constants/sub/rules-list-table-constants";
import { useRulesContext } from "../../RulesListIndex/context";
import { convertToArray, isRule } from "../utils";

const useRuleTableActions = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const { UNGROUPED_GROUP_ID } = RULES_LIST_TABLE_CONSTANTS;
  const {
    setRuleToDuplicate,
    setIsDuplicateRuleModalActive,
    setIsRenameGroupModalActive,
    setIdOfGroupToRename,
    setIsDeleteConfirmationModalActive,
    setIsChangeGroupModalActive,
    setSelectedRows,
  } = useRulesContext();

  const clearSelectedRows = useCallback(() => {
    setSelectedRows([]);
  }, [setSelectedRows]);

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

  const toggleSharingModal = (rules: RuleObj | RuleObj[]) => {
    const updatedRules = convertToArray<RuleObj>(rules);
    const rulesToShare = updatedRules.filter(isRule);
    const ruleIds = rulesToShare.map((rule) => rule.id);

    dispatch(
      actions.toggleActiveModal({
        modalName: "sharingModal",
        newValue: true,
        newProps: {
          selectedRules: ruleIds,
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

  const handleRuleShare = (rules: RuleObj | RuleObj[]) => {
    // TODO
    // trackShareButtonClicked("rules_list");
    user.loggedIn ? toggleSharingModal(rules) : promptUserToSignup(AUTH.SOURCE.SHARE_RULES);
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

  const updateMultipleRecordsInStorage = useCallback(
    (updatedRecords: RuleObj[], originalRecords: RuleObj[]) => {
      if (updatedRecords.length === 0) return;

      dispatch(rulesActions.ruleObjUpsertMany(updatedRecords));

      return StorageService(appMode)
        .saveMultipleRulesOrGroups(updatedRecords)
        .then(() => console.log("Records updated in Storage Service"))
        .catch(() => dispatch(rulesActions.ruleObjUpsertMany(originalRecords)));
    },
    [appMode, dispatch]
  );

  const handleDuplicateRuleClick = (rule: RuleObj) => {
    setRuleToDuplicate(rule);
    setIsDuplicateRuleModalActive(true);
  };

  const closeDuplicateRuleModal = () => {
    setRuleToDuplicate(null);
    setIsDuplicateRuleModalActive(false);
  };

  const handleDeleteRecordClick = (records: RuleObj | RuleObj[]) => {
    const updatedRecords = convertToArray<RuleObj>(records);
    setSelectedRows(updatedRecords);
    setIsDeleteConfirmationModalActive(true);
  };

  const closeDeleteRuleModal = () => {
    setSelectedRows([]);
    setIsDeleteConfirmationModalActive(false);
  };

  const handleRenameGroupClick = (group: RuleObj) => {
    setIsRenameGroupModalActive(true);
    setIdOfGroupToRename(group.id);
  };

  const closeRenameGroupModal = () => {
    setIsRenameGroupModalActive(false);
    setIdOfGroupToRename(null);
  };

  const handleUngroupSelectedRulesClick = useCallback(
    (selectedRecords: RuleObj[]) => {
      const updateRules = selectedRecords.reduce(
        (rules, record) =>
          isRule(record) && record.groupId !== UNGROUPED_GROUP_ID
            ? [...rules, { ...record, groupId: UNGROUPED_GROUP_ID }]
            : rules,
        []
      );

      return updateMultipleRecordsInStorage(updateRules, selectedRecords);
    },
    [UNGROUPED_GROUP_ID, updateMultipleRecordsInStorage]
  );

  const handleChangeRuleGroupClick = (records: RuleObj | RuleObj[]) => {
    const updatedRecords = convertToArray<RuleObj>(records);
    const selectedRules = updatedRecords.filter(isRule);
    setSelectedRows(selectedRules);
    setIsChangeGroupModalActive(true);
  };

  const closeChangeRuleGroupModal = () => {
    setSelectedRows([]);
    setIsChangeGroupModalActive(false);
  };

  // FIXME: Add Deactivate all rules support
  const handleActivateOrDeactivateRecords = (records: RuleObj[]) => {
    // const activeRulesCount = getActiveRules(records).length;
    // const inactiveRulesCount = records.length - activeRulesCount;

    const updatedRecords = records.map((record) => ({
      ...record,
      status: RuleObjStatus.ACTIVE,
    }));

    // setSelectedRows(records);
    updateMultipleRecordsInStorage(updatedRecords, records).then(() => {
      // add analytics
      toast.success(`Rules activated!`);
    });
  };

  const handlePinRecordClick = (record: RuleObj) => {
    let currentOwner;

    if (record.currentOwner) {
      currentOwner = user?.details?.profile?.uid || null;
    } else {
      currentOwner = record.currentOwner;
    }

    const updatedRecord = {
      ...record,
      currentOwner,
      isFavourite: !record.isFavourite,
    };

    updateRuleInStorage(updatedRecord, record).then(() => {
      // trackRulePinToggled(newValue);
    });
  };

  return {
    clearSelectedRows,
    handleStatusToggle,
    handleRuleShare,
    handleDuplicateRuleClick,
    closeDuplicateRuleModal,
    handleDeleteRecordClick,
    closeDeleteRuleModal,
    handleRenameGroupClick,
    closeRenameGroupModal,
    handleChangeRuleGroupClick,
    closeChangeRuleGroupModal,
    handleUngroupSelectedRulesClick,
    handleActivateOrDeactivateRecords,
    handlePinRecordClick,
  };
};

export default useRuleTableActions;
