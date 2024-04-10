import { Group, RecordType, Rule, StorageRecord } from "../types/rules";

export const isRule = (record: StorageRecord): record is Rule => {
  return record.objectType === RecordType.RULE;
};

// TODO: Move this to features/rules
export const isGroup = (record: StorageRecord): record is Group => {
  return record.objectType === RecordType.GROUP;
};
