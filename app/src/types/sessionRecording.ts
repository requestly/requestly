import { RuleSourceKey, RuleSourceOperator } from "@requestly/shared/types/entities/rules";

export type SessionRecordingPageSource = {
  id?: string;
  key: RuleSourceKey;
  value: string;
  isActive: boolean;
  operator: RuleSourceOperator;
};
