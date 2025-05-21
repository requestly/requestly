import React, { createContext, useCallback, useContext } from "react";
import {
  trackNewRuleButtonClicked,
  trackRulePinToggled,
  trackRuleToggled,
} from "modules/analytics/events/common/rules";
import { useRulesModalsContext } from "./modals";
import { isGroup, isRule } from "../utils";
import RULES_LIST_TABLE_CONSTANTS from "config/constants/sub/rules-list-table-constants";
import { getAppMode, getIsRefreshRulesPending, getUserAttributes } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useDispatch, useSelector } from "react-redux";
import { recordsActions } from "store/features/rules/slice";
import { StorageService } from "init";
import { trackShareButtonClicked } from "modules/analytics/events/misc/sharing";
import { globalActions } from "store/slices/global/slice";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import {
  trackGroupChangedEvent,
  trackGroupPinToggled,
  trackGroupStatusToggled,
  trackSampleRuleToggled,
} from "../analytics";
import { submitAttrUtil, trackRQLastActivity } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { RuleTableRecord } from "../screens/rulesList/components/RulesList/components/RulesTable/types";
import { updateGroupOfSelectedRules } from "components/features/rules/ChangeRuleGroupModal/actions";
import { getAllRulesOfGroup } from "utils/rules/misc";
import { SOURCE } from "modules/analytics/events/common/constants";
import { Group, RecordStatus, Rule, StorageRecord } from "@requestly/shared/types/entities/rules";
import { trackSignUpButtonClicked } from "modules/analytics/events/common/auth/signup";
import { RULES_WITHOUT_LIMITS } from "../constants";

// FIXME: Make all bulk actions async to handle loading state properly
type RulesActionContextType = {
  createRuleAction: (source?: string) => void;
  createGroupAction: () => void;
  importRecordsAction: () => void;
  recordsUngroupAction: (records: StorageRecord[]) => Promise<any>; // TODO: add proper type
  recordsChangeGroupAction: (records?: StorageRecord[], onSuccess?: Function) => void;
  recordsShareAction: (records?: StorageRecord[], onSuccess?: Function) => void;
  recordsDeleteAction: (records: StorageRecord[], onSuccess?: Function) => void;
  recordStatusToggleAction: (records: StorageRecord, showToast?: boolean) => void;
  recordsStatusUpdateAction: (records: StorageRecord[], value: RecordStatus, onSuccess?: Function) => void;
  recordDuplicateAction: (record: StorageRecord) => void;
  recordRenameAction: (record: StorageRecord) => void;
  groupDeleteAction: (group: Group) => void;
  recordsPinAction: (records: StorageRecord[]) => void;
  updateGroupOnDrop: (record: RuleTableRecord, groupId: string, onSuccess?: () => void) => void;
  groupShareAction: (group: Group, onSuccess?: () => void) => void;
};

const RulesActionContext = createContext<RulesActionContextType>(null);

interface RulesProviderProps {
  children: React.ReactElement;
}

const { UNGROUPED_GROUP_ID } = RULES_LIST_TABLE_CONSTANTS;

export const RulesActionContextProvider: React.FC<RulesProviderProps> = ({ children }) => {
  const dispatch = useDispatch();

  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);

  const {
    openCreateGroupModalAction,
    openImportRecordsModalAction,
    openChangeRecordsGroupModalAction,
    openDeleteRecordsModalAction,
    openDuplicateRecordModalAction,
    openRenameGroupModalAction,
    openGroupDeleteModalAction,
  } = useRulesModalsContext();

  /** Generic */
  const updateRecordInStorage = useCallback(
    async (updatedRecord: StorageRecord, originalRecord: StorageRecord) => {
      dispatch(recordsActions.upsertRecord(updatedRecord));

      return StorageService(appMode)
        .saveRuleOrGroup(updatedRecord, { silentUpdate: true })
        .then(() => {
          Logger.log("Rule updated in Storage Service");
        })
        .catch(() => {
          dispatch(recordsActions.upsertRecord(originalRecord));
        });
    },
    [appMode, dispatch]
  );

  const updateRecordsInStorage = useCallback(
    async (updatedRecords: StorageRecord[], originalRecords: StorageRecord[]) => {
      if (updatedRecords.length === 0) return Promise.resolve();

      dispatch(recordsActions.upsertRecords(updatedRecords));

      return StorageService(appMode)
        .saveMultipleRulesOrGroups(updatedRecords)
        .then(() => Logger.log("Records updated in Storage Service"))
        .catch(() => dispatch(recordsActions.upsertRecords(originalRecords)));
    },
    [appMode, dispatch]
  );

  const createRuleAction = useCallback((source = "") => {
    Logger.log("[DEBUG]", "createRuleAction");
    trackNewRuleButtonClicked(source);
    return;
  }, []);

  const createGroupAction = useCallback(() => {
    Logger.log("[DEBUG]", "createGroupAction");
    openCreateGroupModalAction();
  }, [openCreateGroupModalAction]);

  const importRecordsAction = useCallback(() => {
    Logger.log("[DEBUG]", "importRecordsAction");
    openImportRecordsModalAction();
  }, [openImportRecordsModalAction]);

  const recordsUngroupAction = useCallback(
    async (records: StorageRecord[]) => {
      Logger.log("[DEBUG]", "recordsUngroupAction", records);

      const updateRules = records.reduce(
        (rules, record) =>
          isRule(record) && record.groupId !== UNGROUPED_GROUP_ID
            ? [...rules, { ...record, groupId: UNGROUPED_GROUP_ID }]
            : rules,
        []
      );

      return updateRecordsInStorage(updateRules, records);
    },
    [updateRecordsInStorage]
  );

  // FIXME: Use promise instead of callback
  const recordsChangeGroupAction = useCallback(
    (records?: StorageRecord[], onSuccess?: Function) => {
      Logger.log("[DEBUG]", "recordsChangeGroup", records);

      if (!records) {
        return;
      }

      const selectedRules = records.filter(isRule);
      openChangeRecordsGroupModalAction(selectedRules, onSuccess);
    },
    [openChangeRecordsGroupModalAction]
  );

  const recordsShareAction = useCallback(
    (records?: StorageRecord[], onSuccess?: Function) => {
      Logger.log("[DEBUG]", "recordsShareAction", records);
      trackShareButtonClicked(onSuccess ? "bulk_action_bar" : "rules_list");
      if (user.loggedIn) {
        const rulesToShare = records.filter(isRule);
        const ruleIds = rulesToShare.map((rule) => rule.id);

        dispatch(
          globalActions.toggleActiveModal({
            modalName: "sharingModal",
            newValue: true,
            newProps: {
              callback: onSuccess,
              selectedRules: ruleIds,
            },
          })
        );
      } else {
        trackSignUpButtonClicked(SOURCE.RULES_LIST);
        dispatch(
          globalActions.toggleActiveModal({
            modalName: "authModal",
            newValue: true,
            newProps: {
              redirectURL: window.location.href,
              src: APP_CONSTANTS.FEATURES.RULES,
              userActionMessage: "Sign up to generate a public shareable link",
              authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
              eventSource: SOURCE.RULES_LIST,
            },
          })
        );
      }
    },
    [dispatch, user.loggedIn]
  );

  const recordsDeleteAction = useCallback(
    (records: StorageRecord[], onSuccess?: Function) => {
      Logger.log("[DEBUG]", "recordsDeleteAction", records);
      openDeleteRecordsModalAction(records, onSuccess);
    },
    [openDeleteRecordsModalAction]
  );

  const recordsStatusUpdateAction = useCallback(
    (records: StorageRecord[], value: RecordStatus, onSuccess?: Function) => {
      Logger.log("[DEBUG]", "recordsStatusUpdateAction", records);

      const handleRecordStatusUpdate = (record: StorageRecord, value: RecordStatus) => {
        const newStatus = value;
        const updatedRecord: StorageRecord = {
          ...record,
          status: newStatus,
        };
        const isSampleRule = updatedRecord.isSample;

        Logger.log("Writing storage in RulesTable changeRuleStatus");

        return updateRecordInStorage(updatedRecord, record).then(() => {
          const isRecordRule = isRule(record);

          if (record.isSample) {
            trackSampleRuleToggled(record.name, newStatus, SOURCE.RULES_LIST);
          }

          if (!isRecordRule) {
            trackGroupStatusToggled(newStatus === "Active");
            return;
          }

          const isFreeRule = isSampleRule || RULES_WITHOUT_LIMITS.includes(record.ruleType);
          if (newStatus.toLowerCase() === "active") {
            trackRQLastActivity("rule_activated");

            submitAttrUtil(
              APP_CONSTANTS.GA_EVENTS.ATTR.NUM_ACTIVE_RULES,
              (userAttributes.num_active_rules ?? 0) + (isFreeRule ? 0 : 1)
            );
            submitAttrUtil(
              APP_CONSTANTS.GA_EVENTS.ATTR.NUM_ACTIVE_RULES_EXCLUDING_FREE_RULES,
              (userAttributes.num_active_rules_excluding_free_rules ?? 0) + (isFreeRule ? 0 : 1)
            );
            trackRuleToggled(record.ruleType, "rules_list", newStatus);
          } else {
            trackRQLastActivity("rule_deactivated");
            submitAttrUtil(
              APP_CONSTANTS.GA_EVENTS.ATTR.NUM_ACTIVE_RULES,
              (userAttributes.num_active_rules ?? 0) - (isFreeRule ? 0 : 1)
            );
            submitAttrUtil(
              APP_CONSTANTS.GA_EVENTS.ATTR.NUM_ACTIVE_RULES_EXCLUDING_FREE_RULES,
              (userAttributes.num_active_rules_excluding_free_rules ?? 0) - (isFreeRule ? 0 : 1)
            );
            trackRuleToggled(record.ruleType, "rules_list", newStatus);
          }
        });
      };

      const allPromises = records.map((record) => {
        return handleRecordStatusUpdate(record, value);
      });

      Promise.all(allPromises).then(() => {
        onSuccess?.();
      });
    },
    [updateRecordInStorage, userAttributes.num_active_rules, userAttributes.num_active_rules_excluding_free_rules]
  );

  const recordStatusToggleAction = useCallback(
    (record: StorageRecord, showToast = true) => {
      Logger.log("[DEBUG]", "recordStatusToggleAction", record);

      const newStatus = record.status === RecordStatus.ACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE;

      const onSuccess = () => {
        if (showToast) {
          const isRecordRule = isRule(record);

          newStatus === RecordStatus.ACTIVE
            ? toast.success(`${isRecordRule ? "Rule" : "Group"} is now ${newStatus.toLowerCase()}`)
            : toast.success(`${isRecordRule ? "Rule" : "Group"} is now ${newStatus.toLowerCase()}`);
        }
      };

      recordsStatusUpdateAction([record], newStatus, onSuccess);
    },
    [recordsStatusUpdateAction]
  );

  const recordDuplicateAction = useCallback(
    (record: StorageRecord) => {
      Logger.log("[DEBUG]", "recordDuplicateAction", record);

      openDuplicateRecordModalAction(record);
    },
    [openDuplicateRecordModalAction]
  );

  const recordRenameAction = useCallback(
    (record: StorageRecord) => {
      Logger.log("[DEBUG]", "recordRenameAction", record);
      if (isRule(record)) {
        return;
      }

      openRenameGroupModalAction(record);
    },
    [openRenameGroupModalAction]
  );

  const groupDeleteAction = useCallback(
    (group: Group) => {
      Logger.log("[DEBUG]", "groupDeleteAction", group);
      openGroupDeleteModalAction(group);
    },
    [openGroupDeleteModalAction]
  );

  const recordsPinAction = useCallback(
    (records: StorageRecord[]) => {
      Logger.log("[DEBUG]", "recordsPinAction", records);
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
    },
    [updateRecordInStorage, user?.details?.profile?.uid]
  );

  const updateGroupOnDrop = useCallback(
    (record: RuleTableRecord, groupId: string = "", onSuccess = () => {}) => {
      if (!record) {
        return;
      }

      updateGroupOfSelectedRules(appMode, [record.id], groupId, user).then(() => {
        trackGroupChangedEvent("rules_list_drag_and_drop");
        onSuccess();
        dispatch(globalActions.updateRefreshPendingStatus({ type: "rules", newValue: !isRulesListRefreshPending }));
      });
    },
    [appMode, user, dispatch, isRulesListRefreshPending]
  );

  const groupShareAction = useCallback(
    async (group: Group, onSuccess?: () => void) => {
      if (!group) return;
      if (user.loggedIn) {
        const groupRules = await getAllRulesOfGroup(appMode, group.id);
        const ruleIds = groupRules.map((rule: Rule) => rule.id);

        dispatch(
          globalActions.toggleActiveModal({
            modalName: "sharingModal",
            newValue: true,
            newProps: {
              callback: onSuccess,
              selectedRules: ruleIds,
            },
          })
        );
      } else {
        trackSignUpButtonClicked(SOURCE.RULES_LIST);
        dispatch(
          globalActions.toggleActiveModal({
            modalName: "authModal",
            newValue: true,
            newProps: {
              redirectURL: window.location.href,
              src: APP_CONSTANTS.FEATURES.RULES,
              userActionMessage: "Sign up to generate a public shareable link",
              authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
              eventSource: SOURCE.RULES_LIST,
            },
          })
        );
      }
    },
    [user.loggedIn, appMode, dispatch]
  );

  const value = {
    createRuleAction,
    createGroupAction,
    importRecordsAction,
    recordsUngroupAction,
    recordsChangeGroupAction,
    recordsShareAction,
    recordsDeleteAction,
    recordStatusToggleAction,
    recordsStatusUpdateAction,
    recordDuplicateAction,
    recordRenameAction,
    groupDeleteAction,
    recordsPinAction,
    updateGroupOnDrop,
    groupShareAction,
  };

  return <RulesActionContext.Provider value={value}>{children}</RulesActionContext.Provider>;
};

export const useRulesActionContext = () => useContext(RulesActionContext);
