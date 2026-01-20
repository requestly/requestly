import { FilterType } from "componentsV2/ContentList";
import { RecordStatus, Rule, StorageRecord } from "@requestly/shared/types/entities/rules";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";

// FIXME: Performance Improvements
// TODO: REname
// TODO: Fix FilterType import
export const getFilteredRecords = (records: StorageRecord[], filterType: FilterType, searchValue: string) => {
  const filteredRecords = getQuickFilteredRecords(records, filterType);

  let searchFilteredRecords = filteredRecords;
  if (searchValue) {
    searchFilteredRecords = filteredRecords.filter((record) => {
      return record.name.toLowerCase().includes(searchValue.toLowerCase());
    });
  }

  return searchFilteredRecords;
};

const getQuickFilteredRecords = (records: StorageRecord[], filterType: FilterType) => {
  switch (filterType) {
    case "all":
      return records;
    case "pinned":
      return records.filter((record) => {
        return record.isFavourite;
      });
    case "active":
      return records.filter((record) => {
        return record.status === RecordStatus.ACTIVE;
      });
    default:
      return records;
  }
};

export const sendIndividualRuleTypesCountAttributes = (rules: Rule[]) => {
  if (rules) {
    const ruleTypesCountMap = rules.reduce((accumulator, rule) => {
      if (accumulator[rule.ruleType]) {
        accumulator[rule.ruleType] += 1;
      } else {
        accumulator[rule.ruleType] = 1;
      }
      return accumulator;
    }, {} as Record<string, number>);

    Object.values(GLOBAL_CONSTANTS.RULE_TYPES).forEach((ruleType) => {
      if (!ruleTypesCountMap[ruleType]) {
        submitAttrUtil(ruleType + "_rules", 0);
      }

      submitAttrUtil(ruleType + "_rules", ruleTypesCountMap[ruleType]);
    });
  }
};
