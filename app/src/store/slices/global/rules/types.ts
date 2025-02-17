import { Rule, Group } from "@requestly/shared/types/entities/rules";

export interface CurrentlySelectedRule {
  data: Rule | boolean;
  config: boolean;
  hasUnsavedChanges: boolean;
  isWorkspaceSwitchConfirmationActive: boolean;
  showDetailsPanel: boolean;
  errors: Record<string, any>;
}

export interface RulesState {
  allRules: {
    rules: Rule[];
    groups: Group[];
  };
  currentlySelectedRule: CurrentlySelectedRule;
  rulesToPopulate: Rule[];
  groupwiseRulesToPopulate: Record<string, Rule[]>;
  selectedRules: Record<string, Rule>;
  selectedGroups: Record<string, Group>;
  lastBackupTimeStamp: number;
  isRulesListLoading: boolean;
  isSampleRulesImported: boolean;
}
