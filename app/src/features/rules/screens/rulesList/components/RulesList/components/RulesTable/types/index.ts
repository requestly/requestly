import { StorageRecord } from "@requestly/shared/types/entities/rules";

export type RuleTableRecord = StorageRecord & {
  children?: StorageRecord[];
};
