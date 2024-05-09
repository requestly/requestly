import { Rule, RulePairSource, SourceKey, SourceOperator } from "types";
import { parseDNRRules } from "./mv3RuleParser";
import { isExtensionManifestVersion3 } from "actions/ExtensionActions";
import { StorageService } from "init";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

const MV3_MIGRATION_DATA = "mv3MigrationData";

enum RuleMigrationChange {
  SOURCE_PATH_MIGRATED = "source_path_migrated",
  SOURCE_PAGEURL_MIGRATED = "source_pageUrl_migrated",
}

export const migrateAllRulesToMV3 = (rules: Rule[], currentWorkspaceId: string = "private"): Rule[] => {
  if (!isExtensionManifestVersion3()) {
    return rules;
  }

  const migrationData = getMV3MigrationData();

  if (migrationData?.[currentWorkspaceId]?.rulesMigrated) {
    return rules;
  }

  const rulesMigrationData: Record<string, any>[] = [];

  const migratedRules = rules.map((rule) => {
    const { rule: migratedRule, ruleMigrationData } = migrateRuleToMV3(rule);

    if (ruleMigrationData) {
      rulesMigrationData.push(ruleMigrationData);
    }

    return migratedRule;
  });

  const currentWorkspaceRulesMigrationData = migrationData?.[currentWorkspaceId]?.rulesMigrationData ?? [];
  currentWorkspaceRulesMigrationData.push(...rulesMigrationData);

  StorageService(GLOBAL_CONSTANTS.APP_MODES.EXTENSION)
    .saveMultipleRulesOrGroups(migratedRules, { workspaceId: currentWorkspaceId })
    .then(() => {
      saveMV3MigrationData({
        ...migrationData,
        [currentWorkspaceId]: {
          rulesMigrated: true,
          rulesMigrationData: rulesMigrationData,
        },
      });
    });

  return migratedRules;
};

export const migrateRuleToMV3 = (rule: Rule) => {
  if (!isExtensionManifestVersion3()) {
    return;
  }

  const ruleMigrationData = generateRuleMigrationData(rule);

  rule.pairs.forEach((pair) => {
    migratePathOperator(pair.source);
    migratePageURLtoPageDomain(pair.source);
  });

  return {
    rule: {
      ...rule,
      extensionRules: parseDNRRules(rule),
    },
    ruleMigrationData,
  };
};

export const getMV3MigrationData = () => {
  const mv3MigrationStatus = window.localStorage.getItem(MV3_MIGRATION_DATA);
  try {
    return JSON.parse(mv3MigrationStatus);
  } catch (e) {
    return {};
  }
};

export const saveMV3MigrationData = (migrationData: any) => {
  window.localStorage.setItem(MV3_MIGRATION_DATA, JSON.stringify(migrationData));
};

const generateRuleMigrationData = (rule: Rule) => {
  const ruleMigrationData: Record<string, any> = {
    id: rule.id,
    migrationChanges: [],
    oldRuleSources: {},
  };

  let isOldDataPresent = false;

  rule.pairs.forEach((pair) => {
    if (pair.source.key === SourceKey.PATH) {
      ruleMigrationData.migrationChanges.push(RuleMigrationChange.SOURCE_PATH_MIGRATED);

      ruleMigrationData.oldRuleSources[pair.id] = {
        sourcePathData: {
          key: pair.source.key,
          operator: pair.source.operator,
          value: pair.source.value,
        },
      };
      isOldDataPresent = true;
    }

    // Detect page URL source filter
    if (pair.source?.filters?.some((filter: any) => filter.pageUrl != null)) {
      ruleMigrationData.migrationChanges.push(RuleMigrationChange.SOURCE_PAGEURL_MIGRATED);

      const filters = pair.source.filters[0];
      ruleMigrationData.oldRuleSources[pair.id] = {
        sourcePageUrlData: {
          ...filters.pageUrl,
        },
      };
      isOldDataPresent = true;
    }
  });

  return isOldDataPresent ? ruleMigrationData : null;
};

const migratePathOperator = (source: RulePairSource): void => {
  if (source.key === SourceKey.PATH) {
    source.operator = SourceOperator.CONTAINS;
    source.key = SourceKey.URL;
  }
};

const migratePageURLtoPageDomain = (source: RulePairSource): void => {
  if (source.filters && source.filters.length > 0) {
    const sourceFilters = source.filters[0];
    if (sourceFilters.pageUrl && sourceFilters.pageUrl.value) {
      let pageDomain = [];
      try {
        pageDomain.push(new URL(sourceFilters.pageUrl.value).hostname);
      } finally {
        delete sourceFilters.pageUrl;
      }
    }
  }
};
