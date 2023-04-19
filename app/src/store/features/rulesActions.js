import APP_CONSTANTS from "../../config/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

const { RULES_LIST_TABLE_CONSTANTS } = APP_CONSTANTS;

export const updateLastBackupTimeStamp = (prevState, action) => {
  prevState.rules.lastBackupTimeStamp = action.payload;
};

export const updateGroups = (prevState, action) => {
  prevState.rules.allRules.groups = action.payload;
};

export const updateRulesAndGroups = (prevState, action) => {
  prevState.rules.allRules.rules = action.payload.rules;
  prevState.rules.allRules.groups = action.payload.groups;
};

export const addRulesAndGroups = (prevState, action) => {
  prevState.rules.allRules.rules.push(...action.payload.rules);
  prevState.rules.allRules.groups.push(...action.payload.groups);
};

export const updateRulesToPopulate = (prevState, action) => {
  prevState.rules.rulesToPopulate = action.payload;
};

export const updateGroupwiseRulesToPopulate = (prevState, action) => {
  prevState.rules.groupwiseRulesToPopulate = action.payload;
};

export const updateIsRulesListLoading = (prevState, action) => {
  prevState.rules.isRulesListLoading = action.payload;
};

export const updateRefreshPendingStatus = (prevState, action) => {
  prevState.pendingRefresh[action.payload.type] = action.payload.newValue
    ? action.payload.newValue
    : !prevState["pendingRefresh"][action.payload.type];
};

export const updateHardRefreshPendingStatus = (prevState, action) => {
  prevState.pendingHardRefresh[action.payload.type] = action.payload.newValue
    ? action.payload.newValue
    : !prevState["pendingHardRefresh"][action.payload.type];
};

// not used anywhere
export const toggleSelectedRule = (prevState, action) => {
  const currentValue = prevState.rules.selectedRules[action.payload.ruleId];

  prevState.rules.selectedRules[action.payload.ruleId] = currentValue ? false : true;
};

export const updateSelectedRules = (prevState, action) => {
  prevState.rules.selectedRules = action.payload;
};

// not used anywhere
export const updateSelectAllRulesOfAGroup = (prevState, action) => {
  const groupId = action.payload.groupId;
  const allRulesUnderThisGroup =
    prevState["rules"]["groupwiseRulesToPopulate"][groupId][RULES_LIST_TABLE_CONSTANTS.GROUP_RULES];
  const newSelectedRulesObject = {};
  allRulesUnderThisGroup.forEach((rule) => {
    newSelectedRulesObject[rule.id] = action.payload.newValue;
  });

  Object.assign(prevState.rules.selectedRules, newSelectedRulesObject);
};

export const clearSelectedRules = (prevState) => {
  prevState.rules.selectedRules = {};
};

export const updateCurrentlySelectedRuleData = (prevState, action) => {
  prevState.rules.currentlySelectedRule.data = action.payload;
};

export const updateCurrentlySelectedRuleConfig = (prevState, action) => {
  prevState.rules.currentlySelectedRule.config = action.payload;
};

export const updateCurrentlySelectedRuleHasUnsavedChanges = (prevState, action) => {
  prevState.rules.currentlySelectedRule.hasUnsavedChanges = action.payload;
};

export const updateCurrentlySelectedRuleErrors = (prevState, action) => {
  prevState.rules.currentlySelectedRule.errors = action.payload;
};

export const clearCurrentlySelectedRuleAndConfig = (prevState) => {
  prevState.rules.currentlySelectedRule = {
    config: false,
    data: false,
    hasUnsavedChanges: false,
  };
};

// not used anywhere
export const selectAllRules = (prevState, action) => {
  const { newValue } = action.payload;

  const newSelectedRules = {};

  prevState.rules.rulesToPopulate.forEach((rule) => {
    newSelectedRules[rule.id] = newValue;
  });

  prevState.rules.selectedRules = newSelectedRules;
};

export const updateRecord = (prevState, action) => {
  const ObjectTypeMap = {
    [GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP]: "groups",
    [GLOBAL_CONSTANTS.OBJECT_TYPES.RULE]: "rules",
  };
  const recordType = ObjectTypeMap[action.payload.objectType];

  const ruleIndex = prevState.rules.allRules[recordType].findIndex((record) => record.id === action.payload.id);

  prevState.rules.allRules[recordType][ruleIndex] = action.payload;
};
