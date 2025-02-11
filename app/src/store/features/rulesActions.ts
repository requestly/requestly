import { PayloadAction } from "@reduxjs/toolkit";
import { getFilterObjectPath } from "utils/rules/getFilterObjectPath";
import { get, set } from "lodash";
import { GlobalSliceState } from "store/slices/global/types";
import { Group } from "@requestly/shared/types/entities/rules";

export const updateLastBackupTimeStamp = (prevState: GlobalSliceState, action: PayloadAction<number>) => {
  prevState.rules.lastBackupTimeStamp = action.payload;
};

export const updateGroups = (prevState: GlobalSliceState, action: PayloadAction<any[]>) => {
  prevState.rules.allRules.groups = action.payload;
};

export const updateRulesAndGroups = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    rules: any[];
    groups: any[];
  }>
) => {
  prevState.rules.allRules.rules = action.payload.rules;
  prevState.rules.allRules.groups = action.payload.groups;
};

export const updateGroupwiseRulesToPopulate = (
  prevState: GlobalSliceState,
  action: PayloadAction<Record<Group["id"], { group_rules: any[] }>>
) => {
  prevState.rules.groupwiseRulesToPopulate = action.payload;
};

export const updateIsRulesListLoading = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.rules.isRulesListLoading = action.payload;
};

export const updateIsSampleRulesImported = (prevState: GlobalSliceState, action: PayloadAction<boolean>) => {
  prevState.rules.isSampleRulesImported = action.payload;
};

export const updateRefreshPendingStatus = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    type: string;
    newValue?: boolean;
  }>
) => {
  prevState.pendingRefresh[action.payload.type] = action.payload.newValue
    ? action.payload.newValue
    : !prevState["pendingRefresh"][action.payload.type];
};

export const updateHardRefreshPendingStatus = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    type: string;
    newValue?: boolean; // not passed from anywhere in code, but leaving it here for legacy reasons
  }>
) => {
  prevState.pendingHardRefresh[action.payload.type] = action.payload.newValue
    ? action.payload.newValue
    : !prevState["pendingHardRefresh"][action.payload.type];
};

export const clearSelectedRecords = (prevState: GlobalSliceState) => {
  prevState.rules.selectedRules = {};
  prevState.rules.selectedGroups = {};
};

export const updateCurrentlySelectedRuleData = (prevState: GlobalSliceState, action: PayloadAction<any>) => {
  prevState.rules.currentlySelectedRule.data = action.payload;
};

export const updateCurrentlySelectedRuleConfig = (prevState: GlobalSliceState, action: PayloadAction<any>) => {
  prevState.rules.currentlySelectedRule.config = action.payload;
};

export const updateCurrentlySelectedRuleHasUnsavedChanges = (
  prevState: GlobalSliceState,
  action: PayloadAction<boolean>
) => {
  prevState.rules.currentlySelectedRule.hasUnsavedChanges = action.payload;
};

export const updateIsWorkspaceSwitchConfirmationActive = (
  prevState: GlobalSliceState,
  action: PayloadAction<boolean>
) => {
  prevState.rules.currentlySelectedRule.isWorkspaceSwitchConfirmationActive = action.payload;
};

export const updateCurrentlySelectedRuleErrors = (
  prevState: GlobalSliceState,
  action: PayloadAction<{ name: string }>
) => {
  prevState.rules.currentlySelectedRule.errors = action.payload;
};

export const clearCurrentlySelectedRuleAndConfig = (prevState: GlobalSliceState) => {
  prevState.rules.currentlySelectedRule = {
    ...prevState.rules.currentlySelectedRule,
    config: false,
    data: false,
    hasUnsavedChanges: false,
  };
};

export const closeCurrentlySelectedRuleDetailsPanel = (prevState: GlobalSliceState) => {
  prevState.rules.currentlySelectedRule = {
    ...prevState.rules.currentlySelectedRule,
    showDetailsPanel: false,
  };
};

// export const updateRecord = (
//   prevState: GlobalSliceState,
//   action: PayloadAction<{
//     objectType: string;
//     id: string;
//     [key: string]: any;
//   }>
// ) => {
//   const ObjectTypeMap = {
//     [GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP]: "groups",
//     [GLOBAL_CONSTANTS.OBJECT_TYPES.RULE]: "rules",
//   };
//   const recordType = ObjectTypeMap[action.payload.objectType];

//   const ruleIndex = prevState.rules.allRules[recordType].findIndex((record) => record.id === action.payload.id);

//   prevState.rules.allRules[recordType][ruleIndex] = action.payload;
// };

// rule editor actions
export const updateRulePairAtGivenPath = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    pairIndex: number;
    updates?: Record<string, any>;
    triggerUnsavedChangesIndication?: boolean;
  }>
) => {
  const { pairIndex, updates = {}, triggerUnsavedChangesIndication = true } = action.payload;

  for (const [modificationPath, value] of Object.entries(updates)) {
    set(prevState.rules.currentlySelectedRule.data?.pairs?.[pairIndex], getFilterObjectPath(modificationPath), value);
  }

  if (triggerUnsavedChangesIndication) {
    prevState.rules.currentlySelectedRule.hasUnsavedChanges = true;
  }
};

export const removeValueInRulePairByIndex = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    pairIndex: number;
    arrayPath: string;
    index: number;
  }>
) => {
  const { pairIndex, arrayPath, index } = action.payload;
  get(prevState.rules.currentlySelectedRule.data?.pairs[pairIndex], arrayPath).splice(index, 1);
  prevState.rules.currentlySelectedRule.hasUnsavedChanges = true;
};

export const removeRulePairByIndex = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    pairIndex: number;
  }>
) => {
  const { pairIndex } = action.payload;
  prevState.rules.currentlySelectedRule.data.pairs?.splice(pairIndex, 1);
  prevState.rules.currentlySelectedRule.hasUnsavedChanges = true;
};

export const addValueInRulePairArray = (
  prevState: GlobalSliceState,
  action: PayloadAction<{
    pairIndex: number;
    arrayPath: string;
    value: any;
  }>
) => {
  const { pairIndex, arrayPath, value } = action.payload;

  const targetArray = get(prevState.rules.currentlySelectedRule.data.pairs[pairIndex], arrayPath);
  set(prevState.rules.currentlySelectedRule.data.pairs[pairIndex], arrayPath, [...(targetArray || []), value]);

  prevState.rules.currentlySelectedRule.hasUnsavedChanges = true;

  // Don't block navigation when its initial state
  if (
    (prevState.rules.currentlySelectedRule?.data?.pairs?.length === 1 &&
      prevState.rules.currentlySelectedRule?.data?.pairs?.[0]?.modifications?.length === 1) ||
    prevState.rules.currentlySelectedRule?.data?.pairs?.[0]?.scripts?.length === 1
  ) {
    prevState.rules.currentlySelectedRule.hasUnsavedChanges = false;
  }
};
