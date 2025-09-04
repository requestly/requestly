import React, { useMemo, useContext, createContext, useReducer, useEffect, useCallback } from "react";
import { Group, Rule } from "../../../types";
import { EXTENSION_MESSAGES } from "../../../constants";
import { recordsInitialState, recordsReducer } from "./recordsReducer";
import { RecordsAction, RecordsActionType, RecordsObject } from "./types";
import { saveRecord } from "../../../storage";
import { updateLastUpdatedTS } from "../../../utils";

interface IRecordsContext extends Record<string, unknown> {
  rules: RecordsObject<Rule>;
  groups: RecordsObject<Group>;
  pinnedRules: Rule[];
  pinnedGroups: Group[];
  updateRule: (rule: Rule, isUpdateFromPinnedRecords: boolean) => void;
  updateGroup: (group: Group) => void;
  recordsDispatch: React.Dispatch<RecordsAction>;
}

const RecordsContext = createContext<IRecordsContext | null>(null);

interface RecordsProviderProps {
  children: React.ReactNode;
}

export const RecordsProvider: React.FC<RecordsProviderProps> = ({ children }) => {
  const [{ rules, groups }, recordsDispatch] = useReducer(recordsReducer, recordsInitialState);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: EXTENSION_MESSAGES.GET_RULES_AND_GROUPS }, (records) => {
      recordsDispatch({
        type: RecordsActionType.INITIALIZE_RULES_AND_GROUPS,
        payload: records,
      });
    });
  }, []);

  const updateRule = useCallback((updatedRule: Rule, isUpdateFromPinnedRecords: boolean = false) => {
    const updatedRuleCopy = { ...updatedRule };
    delete updatedRuleCopy.isRemoved;

    saveRecord(updatedRuleCopy.id, updatedRuleCopy);
    recordsDispatch({
      type: RecordsActionType.UPDATE_RULE,
      payload: { rule: updatedRule, isUpdateFromPinnedRecords },
    });

    updateLastUpdatedTS();
    chrome.runtime.sendMessage({
      action: EXTENSION_MESSAGES.NOTIFY_RECORD_UPDATED_IN_POPUP,
      payload: updatedRule,
    });
  }, []);

  const updateGroup = useCallback((updatedGroup: Group) => {
    const updatedGroupCopy = { ...updatedGroup };
    delete updatedGroupCopy.isRemoved;

    saveRecord(updatedGroupCopy.id, updatedGroupCopy);
    recordsDispatch({
      type: RecordsActionType.UPDATE_GROUP,
      payload: updatedGroup,
    });

    updateLastUpdatedTS();
    chrome.runtime.sendMessage({
      action: EXTENSION_MESSAGES.NOTIFY_RECORD_UPDATED_IN_POPUP,
      payload: updatedGroup,
    });
  }, []);

  const pinnedGroups = useMemo(
    () =>
      Object.values(groups).reduce(
        (pinnedGroups, group: Group) =>
          group.isFavourite || (!group.isFavourite && group.isRemoved)
            ? [
                ...pinnedGroups,
                {
                  ...group,
                  children: Object.values(rules).filter((rule: Rule) => rule.groupId === group.id),
                },
              ]
            : pinnedGroups,
        []
      ) as Group[],
    [rules, groups]
  );

  const pinnedRules = useMemo(() => {
    const groupIdSet = pinnedGroups.reduce((result: Set<string>, group) => result.add(group.id), new Set());

    return Object.values(rules).filter(
      (rule) => !groupIdSet.has(rule.groupId) && (rule.isFavourite || (!rule.isFavourite && rule.isRemoved))
    );
  }, [rules, groups]);

  const values = useMemo(
    () => ({
      rules,
      groups,
      updateRule,
      updateGroup,
      pinnedRules,
      pinnedGroups,
      recordsDispatch,
    }),
    [rules, groups, pinnedRules, pinnedGroups]
  );

  return <RecordsContext.Provider value={values}>{children}</RecordsContext.Provider>;
};

export const useRecords = () => useContext(RecordsContext);
