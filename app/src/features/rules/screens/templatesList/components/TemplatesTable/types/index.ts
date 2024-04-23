import { RuleRecord, RuleType } from "features/rules/types/rules";

interface TemplateRuleDefinition extends RuleRecord {
  ruleType: RuleType;
  pairs: any[];
  isSample?: boolean;
  preserveCookie?: boolean;
  version?: number;
}

export type TemplateRecord = {
  name: string;
  description: string;
  isSharedList: boolean;
  isFeatured: boolean;
  imageURL?: string;
  tags?: string[];
  data: {
    targetAppMode: string[];
    ruleDefinition?: TemplateRuleDefinition;
    shareId?: string;
    sharedListName?: string;
  };
};
