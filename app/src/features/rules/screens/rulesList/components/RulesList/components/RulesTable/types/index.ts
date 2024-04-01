import { StorageRecord } from "features/rules/types/rules";

export type RuleTableRecord = StorageRecord & {
  children?: StorageRecord[];
};
