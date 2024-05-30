import { Group, Rule } from "../../../types";

export type RecordsObject<T> = { [id: string]: T };

export type RecordsState = {
  rules: RecordsObject<Rule>;
  groups: RecordsObject<Group>;
};

export enum RecordsActionType {
  INITIALIZE_RULES_AND_GROUPS = "initializeRulesAndGroups",
  UPDATE_RULE = "updateRule",
  UPDATE_GROUP = "updateGroup",
}

export type RecordsAction =
  | {
      type: RecordsActionType.INITIALIZE_RULES_AND_GROUPS;
      payload: { rules: Rule[]; groups: Group[] };
    }
  | {
      type: RecordsActionType.UPDATE_RULE;
      payload: { rule: Rule; isUpdateFromPinnedRecords: boolean };
    }
  | {
      type: RecordsActionType.UPDATE_GROUP;
      payload: Group;
    };
