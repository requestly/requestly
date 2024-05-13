import { Rule, RulePairSource, SourceFilter, SourceKey, SourceOperator } from "types";
import { parseDNRRules } from "./mv3RuleParser";
import { isExtensionManifestVersion3 } from "actions/ExtensionActions";
import { StorageService } from "init";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

const MV3_MIGRATION_DATA = "mv3MigrationData";

enum RuleMigrationChange {
  SOURCE_PATH_MIGRATED = "source_path_migrated",
  SOURCE_PAGEURL_MIGRATED = "source_pageUrl_migrated",
}

export const migrateAllRulesToMV3 = (rules: Rule[], currentWorkspaceId: string): Rule[] => {
  console.log("[Debug] Before Migration", { rules });

  const rulesMigrationLogs: Record<string, any> = {};

  const migratedRules = rules.map((rule) => {
    const { rule: migratedRule, ruleMigrationLogs } = migrateRuleToMV3(rule);

    if (ruleMigrationLogs) {
      rulesMigrationLogs[migratedRule.id] = ruleMigrationLogs;
    }

    return migratedRule;
  });

  const workspaceId = currentWorkspaceId ? currentWorkspaceId : null;
  const migrationData = getMV3MigrationData() || {};
  const currentWorkspaceMigrationData = migrationData[workspaceId ? workspaceId : "private"];

  console.log("[Debug] After Migration", { currentWorkspaceMigrationData, rulesMigrationLogs, migratedRules });

  StorageService(GLOBAL_CONSTANTS.APP_MODES.EXTENSION)
    .saveMultipleRulesOrGroups(migratedRules, { workspaceId: workspaceId })
    .then(() => {
      // StorageService(GLOBAL_CONSTANTS.APP_MODES.EXTENSION).saveRecord({ [APP_CONSTANTS.LAST_UPDATED_TS]: Date.now() });
      saveMV3MigrationData({
        ...migrationData,
        [workspaceId ? workspaceId : "private"]: {
          rulesMigrationLogs: { ...currentWorkspaceMigrationData?.rulesMigrationLogs, ...rulesMigrationLogs },
        },
      });
    });

  return migratedRules;
};

export const migrateRuleToMV3 = (rule: Rule): { rule: Rule; ruleMigrationLogs: any } => {
  if (rule?.version === "3.0.0") {
    console.log("[Debug] Rule already migrated to v3.0.0", { rule });
    return {
      rule,
      ruleMigrationLogs: null,
    };
  }

  const ruleMigrationLogs: Record<string, any>[] = [];

  rule.pairs.forEach((pair) => {
    const pathMigrationStatus = migratePathOperator(pair.source);
    if (pathMigrationStatus) {
      console.log("!!!debug", "pathMigration Status", pathMigrationStatus);
      ruleMigrationLogs.push(pathMigrationStatus);
    }

    const pageUrlMigrationStatus = migratePageURLtoPageDomain(pair.source);
    if (pageUrlMigrationStatus) {
      console.log("!!!debug", "pageURLMigrationStatus", pageUrlMigrationStatus);
      ruleMigrationLogs.push(pageUrlMigrationStatus);
    }
  });

  const finalRule = {
    ...rule,
    extensionRules: parseDNRRules(rule),
    version: "3.0.0",
  };

  console.log("[Debug] Migrated Rule", { beforeRule: rule, finalRule });

  return {
    rule: finalRule,
    ruleMigrationLogs: ruleMigrationLogs.length ? ruleMigrationLogs : null,
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

const migratePathOperator = (
  source: RulePairSource
): {
  type: RuleMigrationChange;
  oldSource: RulePairSource;
} => {
  if (source.key === SourceKey.PATH) {
    source.operator = SourceOperator.CONTAINS;
    source.key = SourceKey.URL;

    return {
      type: RuleMigrationChange.SOURCE_PATH_MIGRATED,
      oldSource: {
        ...source,
      },
    };
  }
};

const migratePageURLtoPageDomain = (
  source: RulePairSource
): {
  type: RuleMigrationChange;
  oldSource: RulePairSource;
} => {
  if (source.filters) {
    const sourceFilters =
      //@ts-ignore
      Array.isArray(source.filters) && source.filters.length ? source.filters[0] : (source.filters as SourceFilter);

    let migrationLog = null;
    let pageDomains: string[];

    if (sourceFilters?.pageUrl?.value && !sourceFilters?.pageDomains) {
      try {
        pageDomains = [new URL(sourceFilters?.pageUrl?.value).hostname];
      } catch (e) {
        pageDomains = [sourceFilters?.pageUrl?.value];
      } finally {
        if (pageDomains?.length > 0) {
          sourceFilters.pageDomains = pageDomains;
        }

        migrationLog = {
          type: RuleMigrationChange.SOURCE_PAGEURL_MIGRATED,
          oldSource: {
            ...source,
            filters: [{ ...sourceFilters }],
          },
        };
      }
    }

    //For backward compatibility until MV3 is release
    if (!isExtensionManifestVersion3() && sourceFilters?.pageDomains?.length > 0) {
      sourceFilters.pageUrl = {};
      sourceFilters.pageUrl.value = sourceFilters.pageDomains[0];
      sourceFilters.pageUrl.operator = SourceOperator.CONTAINS;
    }

    return migrationLog;
  }
};
