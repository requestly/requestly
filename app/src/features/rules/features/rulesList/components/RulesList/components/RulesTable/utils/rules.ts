import { RuleTableRecord } from "../types";
import { Rule, StorageRecord, RecordStatus, RecordType, Group } from "features/rules/types/rules";

// TODO: Move this to features/rules
export const isRule = (record: StorageRecord): record is Rule => {
  return record.objectType === RecordType.RULE;
};

// TODO: Move this to features/rules
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

// export const getActiveRecords = (records: StorageRecord[]): StorageRecord[] => {
//   const activeRecords: StorageRecord[] = [];
//   const seenGroupIds = new Set<Group["id"]>();
//   const allActiveRules: Rule[] = [];
//   const groups: Record<string, Group> = {};

//   records.forEach((record) => {
//     if (isRule(record) && record.status === RecordStatus.ACTIVE) {
//       allActiveRules.push(record);
//     } else if (isGroup(record)) {
//       groups[record.id] = record;
//     }
//   });

//   allActiveRules.forEach((activeRule) => {
//     if (activeRule.groupId && groups[activeRule.groupId] && !seenGroupIds.has(activeRule.groupId)) {
//       activeRecords.push(groups[activeRule.groupId]);
//       seenGroupIds.add(activeRule.groupId);
//     }
//   });
//   return [...activeRecords, ...allActiveRules];
// };

// export const getPinnedRecords = (recordsMap: Record<string, StorageRecord>) => {
//   let pinnedRecords: StorageRecord[] = [];

//   Object.values(recordsMap).forEach((record) => {
//     //If a group is pinned then show all the rules in that group (irrespective of whether they are pinned or not)
//     if (record.isFavourite || (isRule(record) && record.groupId && recordsMap[record.groupId].isFavourite)) {
//       pinnedRecords.push(record);
//     }
//   });

//   return pinnedRecords;
// };

// ✅
// FIXME: Performance Improvements
export const recordsToContentTableRecordsAdapter = (records: StorageRecord[]): RuleTableRecord[] => {
  const adaptedRecordMap: { [id: StorageRecord["id"]]: RuleTableRecord } = {};

  const otherRecords = records
    .filter((record) => !isRecordWithGroupId(record))
    .map((record) => (isGroup(record) ? ({ ...record, children: [] } as Group) : record));

  otherRecords.forEach((record) => {
    adaptedRecordMap[record.id] = record;
  });

  const groupedRecords = records.filter(isRecordWithGroupId);
  groupedRecords.forEach((record) => {
    if (adaptedRecordMap[record.groupId]) {
      const updatedRecord: RuleTableRecord = {
        ...(adaptedRecordMap[record.groupId] as Group),
        children: [...adaptedRecordMap[record.groupId].children, record],
      };
      adaptedRecordMap[record.groupId] = updatedRecord;
    } else {
      // GroupId doesn't exist
      adaptedRecordMap[record.id] = record;
    }
  });

  const finalAdaptedData = Object.values(adaptedRecordMap);
  return finalAdaptedData;
};

// Adds group if children present  in records
// Adds all children if group present in records
// FIXME: Performance Improvements
export const enhanceRecords = (
  records: StorageRecord[],
  allRecordsMap: { [id: string]: StorageRecord }
): StorageRecord[] => {
  let enhancedRecordsMap: { [id: string]: StorageRecord } = {};

  // Create map for existing records
  records.forEach((record) => {
    enhancedRecordsMap[record.id] = record;
  });

  records.forEach((record) => {
    if (isRecordWithGroupId(record) && record?.groupId && allRecordsMap[record.groupId]) {
      enhancedRecordsMap[record.groupId] = allRecordsMap[record.groupId];
    } else if (isGroup(record)) {
      // Can we keep reverse map of group to children elements somehow?
      const rulesInGroup = Object.values(allRecordsMap).filter(
        (r: StorageRecord) => isRule(r) && r?.groupId === record.id
      );
      rulesInGroup.forEach((rule) => {
        enhancedRecordsMap[rule.id] = rule;
      });
    }
  });

  return Object.values(enhancedRecordsMap);
};

export const checkIsRuleGroupDisabled = (allRecordsMap: Record<string, StorageRecord>, record: RuleTableRecord) => {
  if (isGroup(record)) return false;
  if (record.groupId?.length && allRecordsMap[record.groupId]?.status === RecordStatus.INACTIVE) {
    return true;
  } else return false;
};
