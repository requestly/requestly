import { Rule, SourceKey } from "types";
import { parseExtensionRules } from "./mv3RuleParser";

const MV3_MIGRATION_DATA = "mv3MigrationData";

export const migrateRuleToMV3 = (rule: Rule): Rule => {
  return {
    ...rule,
    extensionRules: parseExtensionRules(rule),
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

export const saveMV3MigrationData = (migrationStatus: any) => {
  window.localStorage.setItem(MV3_MIGRATION_DATA, JSON.stringify(migrationStatus));
};

export const detectAndGenerateMV3RulesMigrationData = (rules: Rule[], currentWorkspaceId: string) => {
  const rulesMigrationData = rules
    .map((rule) => generateRuleMigrationData(rule, currentWorkspaceId))
    .filter((data) => !!data);

  const migrationData = getMV3MigrationData();

  const currentWorkspaceRulesMigrationData = migrationData?.[currentWorkspaceId]?.rulesMigrationData ?? [];
  currentWorkspaceRulesMigrationData.push(...rulesMigrationData);

  return currentWorkspaceRulesMigrationData;
};

const generateRuleMigrationData = (rule: Rule, currentWorkspaceId: string) => {
  const ruleMigrationData: Record<string, any> = {
    id: rule.id,
    migrationChanges: [],
    oldRuleSources: {},
  };

  let isOldDataPresent = false;

  rule.pairs.forEach((pair) => {
    if (pair.source.key === SourceKey.PATH) {
      ruleMigrationData.migrationChanges.push("source_path_migrated");

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
      ruleMigrationData.migrationChanges.push("source_pageUrl_migrated");

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
