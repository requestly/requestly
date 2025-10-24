import { Group, Rule } from "@requestly/shared/types/entities/rules";

export enum RuleEditorMode {
  EDIT = "edit",
  CREATE = "create",
}

export type RuleTemplate = {
  id: string;
  name: string;
  description: string;
  data: {
    ruleData: Rule | Group;
  };
};
