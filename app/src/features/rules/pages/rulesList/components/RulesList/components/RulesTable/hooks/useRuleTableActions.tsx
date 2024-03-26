import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StorageRecord, RecordStatus, Rule, Group } from "features/rules/types/rules";
import { RuleTableRecord } from "../types";
import { getAppMode, getUserAttributes, getUserAuthDetails } from "store/selectors";
import { recordsActions } from "store/features/rules/slice";
import Logger from "lib/logger";
import { StorageService } from "init";
import { toast } from "utils/Toast";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import RULES_LIST_TABLE_CONSTANTS from "config/constants/sub/rules-list-table-constants";
import { useRulesContext } from "../../../context";
import { isRule } from "../utils";
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
    setSelectedRows,

    groupDeleteAction,
    changeRulesGroupAction,
    createGroupAction,
    importRecordsAction,
    deleteRecordsAction,
    renameGroupAction,
    duplicateRuleAction,
  } = useRulesContext();

  const clearSelectedRows = useCallback(() => {
    setSelectedRows([]);
  }, [setSelectedRows]);

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

  const updateRecordsInStorage = useCallback(
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

  const handleRecordsStatusToggle = (records: RuleTableRecord[], showToast = true) => {
    const handleRecordStatusToggle = (record: RuleTableRecord, showToast = true) => {
      const newStatus = record.status === RecordStatus.ACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE;
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

    records.forEach((record) => {
      handleRecordStatusToggle(record, showToast);
    });
  };

  const handleRecordsPin = (records: StorageRecord[]) => {
    const handlePinRecord = (record: StorageRecord) => {
      let currentOwner;

      // TODO: Cleanup: Why??
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

    records.forEach((r) => handlePinRecord(r));
  };

  const handleRecordsImport = () => {
    importRecordsAction();
  };

  const handleGroupCreate = () => {
    createGroupAction();
  };

  // ✅ Refractored below this
  const handleRecordRename = (record: StorageRecord) => {
    if (isRule(record)) {
      return;
    }

    renameGroupAction(record);
  };

  const handleGroupDelete = (group: Group) => {
    groupDeleteAction(group);
  };

  const handleRecordDuplicate = (record: StorageRecord) => {
    if (isGroup(record)) {
      return;
    }

    duplicateRuleAction(record);
  };

  const handleRecordsUngroup = (selectedRecords: StorageRecord[]) => {
    const updateRules = selectedRecords.reduce(
      (rules, record) =>
        isRule(record) && record.groupId !== UNGROUPED_GROUP_ID
          ? [...rules, { ...record, groupId: UNGROUPED_GROUP_ID }]
          : rules,
      []
    );

    return updateRecordsInStorage(updateRules, selectedRecords);
  };

  const handleRecordsChangeGroup = (records?: StorageRecord[], onSuccess?: Function) => {
    if (!records) {
      return;
    }

    const selectedRules = records.filter(isRule);
    changeRulesGroupAction(selectedRules, onSuccess);
  };

  const handleRecordsShare = (records: StorageRecord[], onSuccess?: Function) => {
    trackShareButtonClicked(onSuccess ? "bulk_action_bar" : "rules_list");
    if (user.loggedIn) {
      const rulesToShare = records.filter(isRule);
      const ruleIds = rulesToShare.map((rule) => rule.id);

      // @ts-ignore
      dispatch(
        actions.toggleActiveModal({
          modalName: "sharingModal",
          newValue: true,
          newProps: {
            callback: onSuccess,
            selectedRules: ruleIds,
          },
        })
      );
    } else {
      promptUserToSignup(SOURCE.SHARE_RULES);
    }
  };

  const handleRecordsDelete = (records: StorageRecord[], onSuccess?: Function) => {
    deleteRecordsAction(records, onSuccess);
  };

  return {
    clearSelectedRows,
    handleGroupCreate,
    handleRecordsStatusToggle,
    handleRecordsPin,
    handleRecordsImport,

    //
    handleRecordRename,
    handleGroupDelete,
    handleRecordDuplicate,
    handleRecordsUngroup,
    handleRecordsChangeGroup,
    handleRecordsShare,
    handleRecordsDelete,
  };
};

export default useRuleTableActions;
