import React, { createContext, useCallback, useContext } from "react";
import { Group, RecordStatus, RuleType, StorageRecord } from "features/rules/types/rules";
import {
  trackNewRuleButtonClicked,
  trackRuleCreationWorkflowStartedEvent,
  trackRulePinToggled,
  trackRuleToggled,
} from "modules/analytics/events/common/rules";
import { redirectToCreateNewRule } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { useRulesModalsContext } from "./modals";
import { isGroup, isRule } from "../utils";
import RULES_LIST_TABLE_CONSTANTS from "config/constants/sub/rules-list-table-constants";
import { getAppMode, getUserAttributes, getUserAuthDetails } from "store/selectors";
import { useDispatch, useSelector } from "react-redux";
import { recordsActions } from "store/features/rules/slice";
import { StorageService } from "init";
import { trackShareButtonClicked } from "modules/analytics/events/misc/sharing";
import { actions } from "store";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { trackGroupPinToggled, trackGroupStatusToggled } from "../analytics";
import { submitAttrUtil, trackRQLastActivity } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";

type RulesActionContextType = {
  createRuleAction: (ruleType?: RuleType, source?: string, groupId?: string) => void;
  createGroupAction: () => void;
  importRecordsAction: () => void;
  recordsUngroupAction: (records: StorageRecord[]) => Promise<any>; // TODO: add proper type
  recordsChangeGroupAction: (records?: StorageRecord[], onSuccess?: Function) => void;
  recordsShareAction: (records?: StorageRecord[], onSuccess?: Function) => void;
  recordsDeleteAction: (records: StorageRecord[], onSuccess?: Function) => void;
  recordsStatusToggleAction: (records: StorageRecord[], showToast?: boolean) => void;
  recordDuplicateAction: (record: StorageRecord) => void;
  recordRenameAction: (record: StorageRecord) => void;
  groupDeleteAction: (group: Group) => void;
  recordsPinAction: (records: StorageRecord[]) => void;
};

const RulesActionContext = createContext<RulesActionContextType>(null);

interface RulesProviderProps {
  children: React.ReactElement;
}

const { UNGROUPED_GROUP_ID } = RULES_LIST_TABLE_CONSTANTS;

export const RulesActionContextProvider: React.FC<RulesProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);

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
  /*****/

  // FIXME: Remove hard coded event source values and refactor this action
  const createRuleAction = useCallback(
    (ruleType?: RuleType, source = "") => {
      console.log("[DEBUG]", "createRuleAction");
      if (ruleType) {
        trackRuleCreationWorkflowStartedEvent(ruleType, source);
      } else {
        trackNewRuleButtonClicked("in_app");
      }
      redirectToCreateNewRule(navigate, ruleType, source || "my_rules");
      return;
    },
    [navigate]
  );

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
        dispatch(
          actions.toggleActiveModal({
            modalName: "authModal",
            newValue: true,
            newProps: {
              redirectURL: window.location.href,
              src: APP_CONSTANTS.FEATURES.RULES,
              userActionMessage: "Sign up to generate a public shareable link",
              authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
              eventSource: "rules_list",
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

  const recordsStatusToggleAction = useCallback(
    (records: StorageRecord[], showToast = true) => {
      Logger.log("[DEBUG]", "recordsStatusToggleAction", records);
      const handleRecordStatusToggle = (record: StorageRecord, showToast = true) => {
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
    },
    [updateRecordInStorage, userAttributes.num_active_rules]
  );

  const recordDuplicateAction = useCallback(
    (record: StorageRecord) => {
      Logger.log("[DEBUG]", "recordDuplicateAction", record);
      if (isGroup(record)) {
        return;
      }

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

  const value = {
    createRuleAction,
    createGroupAction,
    importRecordsAction,
    recordsUngroupAction,
    recordsChangeGroupAction,
    recordsShareAction,
    recordsDeleteAction,
    recordsStatusToggleAction,
    recordDuplicateAction,
    recordRenameAction,
    groupDeleteAction,
    recordsPinAction,
  };

  return <RulesActionContext.Provider value={value}>{children}</RulesActionContext.Provider>;
};

export const useRulesActionContext = () => useContext(RulesActionContext);
