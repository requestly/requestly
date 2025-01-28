import { Rule } from "@requestly/shared/types/entities/rules";

type TemplateRuleDefinition = Rule & {
  isSample?: boolean;
  preserveCookie?: boolean;
  version?: number;
};

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
