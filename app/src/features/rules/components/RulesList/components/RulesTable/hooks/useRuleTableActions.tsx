import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StorageRecord, RecordStatus, Rule, Group } from "features/rules/types/rules";
import { RuleTableDataType } from "../types";
import { getAppMode, getUserAttributes, getUserAuthDetails } from "store/selectors";
import { recordsActions } from "store/features/rules/slice";
import Logger from "lib/logger";
import { StorageService } from "init";
import { toast } from "utils/Toast";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import RULES_LIST_TABLE_CONSTANTS from "config/constants/sub/rules-list-table-constants";
import { useRulesContext } from "../../RulesListIndex/context";
import { convertToArray, isRule } from "../utils";
import { submitAttrUtil, trackRQLastActivity } from "utils/AnalyticsUtils";
import { trackRulePinToggled, trackRuleToggled } from "modules/analytics/events/common/rules";
import { trackGroupPinToggled, trackGroupStatusToggled } from "features/rules/analytics";
import { trackShareButtonClicked } from "modules/analytics/events/misc/sharing";
import { isGroup } from "../utils";

const useRuleTableActions = () => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const { UNGROUPED_GROUP_ID } = RULES_LIST_TABLE_CONSTANTS;
  const {
    setRuleToDuplicate,
    setIsDuplicateRuleModalActive,
    setIsRenameGroupModalActive,
    setIdOfGroupToRename,
    setIsDeleteConfirmationModalActive,
    setIsChangeGroupModalActive,
    setSelectedRows,
    setIsUngroupOrDeleteRulesModalActive,
    setGroupToEmpty,
  } = useRulesContext();

  const clearSelectedRows = useCallback(() => {
    setSelectedRows([]);
  }, [setSelectedRows]);

  const handleStatusToggle = (records: RuleTableDataType[], showToast = true) => {
    records.forEach((record) => {
      const status = record.status === RecordStatus.ACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE;
      changeRecordStatus(status, record, showToast);
    });
  };

  const changeRecordStatus = (newStatus: RecordStatus, record: StorageRecord, showToast: boolean) => {
    // TODO: Handle Group status toggle

    // TODO: Why is this added??
    // if (rule.currentOwner) {
    //   currentOwner = user?.details?.profile?.uid || null;
    // } else {
    //   currentOwner = rule.currentOwner;
    // }

    const updatedRecord: StorageRecord = {
      ...record,
      status: newStatus,
    };

    Logger.log("Writing storage in RulesTable changeRuleStatus");
    updateRecordInStorage(updatedRecord, record).then(() => {
      const isRecordRule = isRule(record);

      //Push Notify
      if (showToast) {
        newStatus === RecordStatus.ACTIVE
          ? toast.success(`${isRecordRule ? "Rule" : "Group"} is now ${newStatus.toLowerCase()}`)
          : toast.success(`${isRecordRule ? "Rule" : "Group"} is now ${newStatus.toLowerCase()}`);
      }

      if (!isRecordRule) {
        trackGroupStatusToggled(newStatus === "Active");
        return;
      }

      if (newStatus.toLowerCase() === "active") {
        trackRQLastActivity("rule_activated");
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_ACTIVE_RULES, userAttributes.num_active_rules + 1);
        trackRuleToggled(record.ruleType, "rules_list", newStatus);
      } else {
        trackRQLastActivity("rule_deactivated");
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_ACTIVE_RULES, userAttributes.num_active_rules - 1);
        trackRuleToggled(record.ruleType, "rules_list", newStatus);
      }
    });
  };

  const toggleSharingModal = (records: StorageRecord | StorageRecord[], clearSelection = () => {}) => {
    const updatedRecords = convertToArray<StorageRecord>(records);
    const rulesToShare = updatedRecords.filter(isRule);
    const ruleIds = rulesToShare.map((rule) => rule.id);

    dispatch(
      actions.toggleActiveModal({
        modalName: "sharingModal",
        newValue: true,
        newProps: {
          callback: clearSelection,
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

  const handleRecordShare = (records: StorageRecord | StorageRecord[], clearSelection?: () => void) => {
    // TODO
    trackShareButtonClicked(clearSelection ? "bulk_action_bar" : "rules_list");
    user.loggedIn ? toggleSharingModal(records, clearSelection) : promptUserToSignup(SOURCE.SHARE_RULES);
  };

  // Generic
  const updateRecordInStorage = async (updatedRecord: StorageRecord, originalRecord: StorageRecord) => {
    dispatch(recordsActions.upsertRecord(updatedRecord));

    return StorageService(appMode)
      .saveRuleOrGroup(updatedRecord, { silentUpdate: true })
      .then(() => {
        console.log("Rule updated in Storage Service");
      })
      .catch(() => {
        dispatch(recordsActions.upsertRecord(originalRecord));
      });
  };

  const updateMultipleRecordsInStorage = useCallback(
    async (updatedRecords: StorageRecord[], originalRecords: StorageRecord[]) => {
      if (updatedRecords.length === 0) return Promise.resolve();

      dispatch(recordsActions.upsertRecords(updatedRecords));

      return StorageService(appMode)
        .saveMultipleRulesOrGroups(updatedRecords)
        .then(() => console.log("Records updated in Storage Service"))
        .catch(() => dispatch(recordsActions.upsertRecords(originalRecords)));
    },
    [appMode, dispatch]
  );

  const handleDuplicateRuleClick = (rule: Rule) => {
    setRuleToDuplicate(rule);
    setIsDuplicateRuleModalActive(true);
  };

  const closeDuplicateRuleModal = () => {
    setRuleToDuplicate(null);
    setIsDuplicateRuleModalActive(false);
  };

  const handleUngroupOrDeleteGroupsClick = (group: Group) => {
    setGroupToEmpty(group);
    setIsUngroupOrDeleteRulesModalActive(true);
  };

  const closeUngroupOrDeleteRulesModal = () => {
    setGroupToEmpty(null);
    setIsUngroupOrDeleteRulesModalActive(false);
  };

  const handleDeleteRecordClick = (records: StorageRecord | StorageRecord[]) => {
    const updatedRecords = convertToArray<StorageRecord>(records);
    setSelectedRows(updatedRecords);
    setIsDeleteConfirmationModalActive(true);
  };

  const closeDeleteRuleModal = () => {
    setSelectedRows([]);
    setIsDeleteConfirmationModalActive(false);
  };

  const handleRenameGroupClick = (group: Group) => {
    setIsRenameGroupModalActive(true);
    setIdOfGroupToRename(group.id);
  };

  const closeRenameGroupModal = () => {
    setIsRenameGroupModalActive(false);
    setIdOfGroupToRename(null);
  };

  const handleUngroupSelectedRecordsClick = useCallback(
    (selectedRecords: StorageRecord[]) => {
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

  const handleChangeRuleGroupClick = (records?: StorageRecord | StorageRecord[]) => {
    if (!records) {
      setIsChangeGroupModalActive(true);
      return;
    }

    const updatedRecords = convertToArray<StorageRecord>(records);
    const selectedRules = updatedRecords.filter(isRule);
    setSelectedRows(selectedRules);
    setIsChangeGroupModalActive(true);
  };

  const closeChangeRuleGroupModal = () => {
    setSelectedRows([]);
    setIsChangeGroupModalActive(false);
  };

  // FIXME: Add Deactivate all rules support
  const handleActivateOrDeactivateRecords = (records: StorageRecord[]) => {
    // const activeRulesCount = getActiveRules(records).length;
    // const inactiveRulesCount = records.length - activeRulesCount;

    const updatedRecords = records.map((record) => ({
      ...record,
      status: RecordStatus.ACTIVE,
    }));

    // setSelectedRows(records);
    updateMultipleRecordsInStorage(updatedRecords, records).then(() => {
      // add analytics
      toast.success(`Rules activated!`);
    });
  };

  const handlePinRecordClick = (record: StorageRecord) => {
    let currentOwner;

    if (record.currentOwner) {
      currentOwner = user?.details?.profile?.uid || null;
    } else {
      currentOwner = record.currentOwner;
    }

    const updatedRecord: StorageRecord = {
      ...record,
      currentOwner,
      isFavourite: !record.isFavourite,
    };

    updateRecordInStorage(updatedRecord, record).then(() => {
      if (isGroup(record)) {
        trackGroupPinToggled(!record.isFavourite);
      } else {
        trackRulePinToggled(record.id, record.ruleType, !record.isFavourite);
      }
    });
  };

  return {
    clearSelectedRows,
    handleStatusToggle,
    handleRecordShare,
    handleDuplicateRuleClick,
    closeDuplicateRuleModal,
    handleUngroupOrDeleteGroupsClick,
    closeUngroupOrDeleteRulesModal,
    handleDeleteRecordClick,
    closeDeleteRuleModal,
    handleRenameGroupClick,
    closeRenameGroupModal,
    handleChangeRuleGroupClick,
    closeChangeRuleGroupModal,
    handleUngroupSelectedRecordsClick,
    handleActivateOrDeactivateRecords,
    handlePinRecordClick,
  };
};

export default useRuleTableActions;
