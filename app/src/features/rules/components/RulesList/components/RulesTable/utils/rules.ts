import { RuleTableDataType } from "../types";
import { Rule, StorageRecord, RecordStatus, RecordType, Group } from "features/rules/types/rules";

export const isRule = (record: StorageRecord): record is Rule => {
  return record.objectType === RecordType.RULE;
};

export const isGroup = (record: StorageRecord): record is Group => {
  return record.objectType === RecordType.GROUP;
};

// Assumes that if groupId is present then it's a rule
export const isRecordWithGroupId = (record: StorageRecord): record is Rule => {
  return "groupId" in record;
};

export const convertToArray = <T>(record: T | T[]): T[] => {
  return Array.isArray(record) ? record : [record];
};

export const getActiveRecords = (records: StorageRecord[]): StorageRecord[] => {
  const activeRecords: StorageRecord[] = [];
  const seenGroupIds = new Set<Group["id"]>();
  const allActiveRules: Rule[] = [];
  const groups: Record<string, Group> = {};

  records.forEach((record) => {
    if (isRule(record) && record.status === RecordStatus.ACTIVE) {
      allActiveRules.push(record);
    } else if (isGroup(record)) {
      groups[record.id] = record;
    }
  });

  allActiveRules.forEach((activeRule) => {
    if (activeRule.groupId && groups[activeRule.groupId] && !seenGroupIds.has(activeRule.groupId)) {
      activeRecords.push(groups[activeRule.groupId]);
      seenGroupIds.add(activeRule.groupId);
    }
  });
  return [...activeRecords, ...allActiveRules];
};

export const getPinnedRecords = (recordsMap: Record<string, StorageRecord>) => {
  let pinnedRecords: StorageRecord[] = [];

  Object.values(recordsMap).forEach((record) => {
    //If a group is pinned then show all the rules in that group (irrespective of whether they are pinned or not)
    if (record.isFavourite || (isRule(record) && record.groupId && recordsMap[record.groupId].isFavourite)) {
      pinnedRecords.push(record);
    }
  });

  return pinnedRecords;
};

// FIXME: Performance Improvements
export const recordsToContentTableDataAdapter = (records: StorageRecord[]): RuleTableDataType[] => {
  const ruleTableDataTypeMap: { [id: StorageRecord["id"]]: RuleTableDataType } = {};

  const groupedRules = records.filter(isRecordWithGroupId);
  const otherRecords = records
    .filter((record) => !isRecordWithGroupId(record))
    .map((record) => (isGroup(record) ? ({ ...record, children: [] } as Group) : record));

  otherRecords.forEach((record) => {
    ruleTableDataTypeMap[record.id] = record;
  });

  groupedRules.forEach((rule) => {
    if (ruleTableDataTypeMap[rule.groupId]) {
      const updatedGroup: Group = {
        ...(ruleTableDataTypeMap[rule.groupId] as Group),
        children: [...(ruleTableDataTypeMap[rule.groupId] as Group).children, rule],
      };
      ruleTableDataTypeMap[rule.groupId] = updatedGroup;
    } else {
      // GroupId doesn't exist
      ruleTableDataTypeMap[rule.id] = rule;
    }
  });

  const finalAdaptedData = Object.values(ruleTableDataTypeMap);

  return finalAdaptedData;
};

export const checkIsRuleGroupDisabled = (allRecordsMap: Record<string, StorageRecord>, record: RuleTableDataType) => {
  if (isGroup(record)) return false;
  if (record.groupId?.length && allRecordsMap[record.groupId]?.status === RecordStatus.INACTIVE) {
    return true;
  } else return false;
};
