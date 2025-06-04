import { isGroup, isRule } from "features/rules/utils";
import { RuleTableRecord } from "../types";
import Logger from "lib/logger";
import { getTemplates } from "backend/rules";
import { addRulesAndGroupsToStorage, processDataToImport } from "features/rules/modals/ImportRulesModal/actions";
import { AppMode } from "utils/syncing/SyncUtils";
import { localSampleRules, sampleRuleDetails } from "../../../constants";
import { generateObjectCreationDate } from "utils/DateTimeUtils";
import { Group, RecordStatus, RecordType, Rule, StorageRecord } from "@requestly/shared/types/entities/rules";
import { RuleTemplate } from "features/rules/types/rules";
import { UserAuth } from "store/slices/global/user/types";

// Assumes that if groupId is present then it's a rule
export const isRecordWithGroupId = (record: StorageRecord): record is Rule => {
  return "groupId" in record;
};

export const convertToArray = <T>(record: T | T[]): T[] => {
  return Array.isArray(record) ? record : [record];
};

// RuleTableRecord -> StorageRecord
export const normalizeRecord = (tableRecord: RuleTableRecord): StorageRecord => {
  if (isGroup(tableRecord)) {
    const _tableRecord = {
      ...tableRecord,
    };

    delete _tableRecord.children;
    return _tableRecord as StorageRecord;
  }
  return tableRecord as StorageRecord;
};

export const normalizeRecords = (tableRecords: RuleTableRecord[]): StorageRecord[] => {
  return tableRecords.map(normalizeRecord);
};

// FIXME: Performance Improvements
// Denormalize records
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

export const getSampleRules = async (fromDb: boolean = false) => {
  try {
    const sampleRuleIds = Object.keys(sampleRuleDetails);

    let templates: RuleTemplate[];
    if (!fromDb) {
      templates = localSampleRules;
    } else {
      templates = await getTemplates(sampleRuleIds);
    }

    const sampleRules: RuleTemplate["data"]["ruleData"][] = templates.map((template) => ({
      ...template.data.ruleData,
      sampleId: template.id,
      isReadOnly: true,
      isSample: true,
      creationDate: generateObjectCreationDate(),
      modificationDate: generateObjectCreationDate(),
    }));

    return sampleRules;
  } catch (error) {
    Logger.log("Something went wrong while fetching sample rules!", error);
    return null;
  }
};

export const importSampleRules = async (user: UserAuth, appMode: AppMode) => {
  const sampleRules = await getSampleRules();

  return processDataToImport(sampleRules, user)
    .then((result) => {
      const processedRulesToImport = (result.data as (Rule | Group)[]).map((record) => {
        return record.objectType === RecordType.GROUP ? { ...record, status: RecordStatus.ACTIVE } : record;
      });

      return addRulesAndGroupsToStorage(appMode, processedRulesToImport).then(() => {
        const groupIdsToExpand = processedRulesToImport.reduce(
          (result, record) => (record.objectType === RecordType.GROUP ? [...result, record.id] : result),
          []
        );

        return groupIdsToExpand;
      });
    })
    .catch((error) => {
      Logger.log("Something went wrong while importing sample rules!", error);
    });
};
