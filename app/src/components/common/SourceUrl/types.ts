import { SourceKey, SourceOperator } from "types/rules";

export type Source = {
  key: SourceKey;
  operator: SourceOperator;
  value: string;
};
