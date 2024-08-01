import { FilterType } from "componentsV2/ContentList";
import { Group, RecordStatus, StorageRecord } from "features/rules/types/rules";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { Rule } from "../../../../../types/rules";
import Logger from "lib/logger";
import { getTemplates } from "backend/rules";
import { User } from "types";
import { addRulesAndGroupsToStorage, processDataToImport } from "features/rules/modals/ImportRulesModal/actions";
import { AppMode } from "utils/syncing/SyncUtils";

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
    // LOCAL
    // TODO: move this into constants file as a map
    const sampleRuleTemplateIds = [
      "9ywxyfxsaaVbfBAJN24f",
      "BpDkxdUAdbSdOJLriwxp",
      "G2EXbUD9B2QiOhgsrtHl",
      "OqFoyPdEUPnQrBEkqjxR",
      "bSEtct1DF1Xgn1Y7okas",
      "jR46qxwfXEMT9SrPzC8L",
      "z6FShnq5xbbnAu8H4JS0",
    ];

    // // PROD
    // const sampleRuleTemplateIds = [
    //   "9ywxyfxsaaVbfBAJN24f",
    //   "BpDkxdUAdbSdOJLriwxp",
    //   "G2EXbUD9B2QiOhgsrtHl",
    //   "OqFoyPdEUPnQrBEkqjxR",
    //   "bSEtct1DF1Xgn1Y7okas",
    //   "jR46qxwfXEMT9SrPzC8L",
    //   "z6FShnq5xbbnAu8H4JS0",
    // ];

    const templates = await getTemplates();

    const sampleRules = templates
      .filter((template) => sampleRuleTemplateIds.includes(template.id))
      .map((template) => ({
        ...template.data.ruleData,
        isEditable: false,
        isSample: true,
        lastModifiedBy: null,
        createdBy: null,
        currentOwner: null,
      }));

    console.log("sampleRules", sampleRules);
    return sampleRules;
  } catch (error) {
    console.log("Something went wrong while fetching sample rules!", error);
    Logger.log("Something went wrong while fetching sample rules!", error);
    return null;
  }
};

export const importSampleRules = async (user: User, appMode: AppMode) => {
  const sampleRules = await getSampleRules();

  processDataToImport(sampleRules, user)
    .then((result) => {
      const processedRulesToImport = (result.data as (Rule | Group)[]).map((record) => ({
        ...record,
        status: RecordStatus.ACTIVE,
      }));

      addRulesAndGroupsToStorage(appMode, processedRulesToImport).then(() => {
        // NOOP
      });
    })
    .catch((error) => {
      console.log("Something went wrong while importing sample rules!", error);
      Logger.log("Something went wrong while importing sample rules!", error);
    });
};
