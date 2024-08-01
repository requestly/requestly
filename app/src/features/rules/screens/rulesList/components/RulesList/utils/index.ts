import { FilterType } from "componentsV2/ContentList";
import { Group, RecordStatus, RecordType, Rule, StorageRecord } from "features/rules/types/rules";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import Logger from "lib/logger";
import { getTemplates } from "backend/rules";
import { User } from "types";
import { addRulesAndGroupsToStorage, processDataToImport } from "features/rules/modals/ImportRulesModal/actions";
import { AppMode } from "utils/syncing/SyncUtils";
import { sampleRuleDetails } from "../constants";

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

export const getSampleRules = async () => {
  try {
    const templates = await getTemplates();

    const sampleRules = templates
      .filter((template) => !!sampleRuleDetails[template.id])
      .map((template) => ({
        ...template.data.ruleData,
        sampleId: template.id,
        isReadOnly: true,
        isSample: true,
        lastModifiedBy: null,
        createdBy: null,
        currentOwner: null,
      }));

    return sampleRules;
  } catch (error) {
    Logger.log("Something went wrong while fetching sample rules!", error);
    return null;
  }
};

export const importSampleRules = async (user: User, appMode: AppMode) => {
  const sampleRules = await getSampleRules();

  return processDataToImport(sampleRules, user)
    .then((result) => {
      const processedRulesToImport = result.data as (Rule | Group)[];

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
