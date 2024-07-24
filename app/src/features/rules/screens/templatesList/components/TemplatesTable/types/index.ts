import { RuleRecord, RuleType } from "features/rules/types/rules";

interface TemplateRuleDefinition extends RuleRecord {
  ruleType: RuleType;
  pairs: any[];
  isSample?: boolean;
  preserveCookie?: boolean;
  version?: number;
}

export type TemplateData = {
  targetAppMode: string[];
  ruleDefinition?: TemplateRuleDefinition;
  shareId?: string;
  sharedListName?: string;
};

export type TemplateRecord = {
  id: string;
  name: string;
  description: string;
  isSharedList: boolean;
  isFeatured: boolean;
  imageURL?: string;
  tags?: string[];
  data: TemplateData;
};
