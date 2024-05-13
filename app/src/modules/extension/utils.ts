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

export const migrateAllRulesToMV3 = (rules: Rule[], currentWorkspaceId: string): Rule[] => {
  if (!isExtensionManifestVersion3() || rules.length === 0) {
    return rules;
  }

  const migrationStatus = getMV3MigrationStatus();
  const workspaceId = currentWorkspaceId ? currentWorkspaceId : null;

  // console.log("!!!debug", "migration Staus", migrationStatus);
  // if (migrationStatus?.[workspaceId ?? "private"]?.rulesMigrated) {
  //   return rules;
  // }

  const rulesMigrationLogs: Record<string, any>[] = [];

  const migratedRules = rules.map((rule) => {
    const { rule: migratedRule, ruleMigrationLogs } = migrateRuleToMV3(rule);

    if (ruleMigrationLogs) {
      rulesMigrationLogs.push(ruleMigrationLogs);
    }

    return migratedRule;
  });

  console.log("!!!debug", "rulesMigeationLogs all rules", rulesMigrationLogs);

  StorageService(GLOBAL_CONSTANTS.APP_MODES.EXTENSION)
    .saveMultipleRulesOrGroups(migratedRules, { workspaceId: workspaceId })
    .then(() => {
      // StorageService(GLOBAL_CONSTANTS.APP_MODES.EXTENSION).saveRecord({ [APP_CONSTANTS.LAST_UPDATED_TS]: Date.now() });
      saveMV3MigrationStatus({
        ...migrationStatus,
        [workspaceId ? workspaceId : "private"]: {
          rulesMigrated: true,
          rulesMigrationLogs,
        },
      });
    });

  return migratedRules;
};

export const migrateRuleToMV3 = (rule: Rule) => {
  if (!isExtensionManifestVersion3()) {
    return;
  }

  const ruleMigrationLogs: Record<string, any> = {
    id: rule.id,
    migrationChanges: [],
  };

  rule.pairs.forEach((pair) => {
    const pathMigrationStatus = migratePathOperator(pair.source);
    if (pathMigrationStatus) {
      console.log("!!!debug", "pathMigration Status", pathMigrationStatus);
      ruleMigrationLogs.migrationChanges.push(pathMigrationStatus);
    }

    const pageUrlMigrationStatus = migratePageURLtoPageDomain(pair.source);
    if (pageUrlMigrationStatus) {
      console.log("!!!debug", "pageURLMigrationStatus", pageUrlMigrationStatus);
      ruleMigrationLogs.migrationChanges.push(pageUrlMigrationStatus);
    }
  });

  return {
    rule: {
      ...rule,
      extensionRules: parseDNRRules(rule),
    },
    ruleMigrationLogs: ruleMigrationLogs.migrationChanges.length ? ruleMigrationLogs : null,
  };
};

export const getMV3MigrationStatus = () => {
  const mv3MigrationStatus = window.localStorage.getItem(MV3_MIGRATION_DATA);
  try {
    return JSON.parse(mv3MigrationStatus);
  } catch (e) {
    return {};
  }
};

export const saveMV3MigrationStatus = (migrationData: any) => {
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
  if (source.filters && source.filters.length > 0) {
    const sourceFilters = source.filters[0];

    if (sourceFilters.pageUrl && sourceFilters.pageUrl.value) {
      let migrationLog = null;
      const pageDomains = [];
      try {
        pageDomains.push(new URL(sourceFilters.pageUrl.value).hostname);
      } catch (e) {
        // Ignore
      } finally {
        migrationLog = {
          type: RuleMigrationChange.SOURCE_PAGEURL_MIGRATED,
          oldSource: {
            ...source,
            filters: [{ ...sourceFilters }],
          },
        };
        sourceFilters.pageDomains = pageDomains;
        delete sourceFilters.pageUrl;
        console.log("!!!debug", "sourceFilters", sourceFilters, source.filters[0]);
      }

      return migrationLog;
    }
  }
};
