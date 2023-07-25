import { SourceKey, SourceOperator } from "./rules";

export type SessionRecordingPageSource = {
  id?: string;
  key: SourceKey;
  value: string;
  isActive: boolean;
  operator: SourceOperator;
};
