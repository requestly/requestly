import { Rule, RulePairSource, RuleType, SourceFilter, SourceKey, SourceOperator } from "types";
import { parseDNRRules } from "./mv3RuleParser";
import { isExtensionManifestVersion3 } from "actions/ExtensionActions";
import { StorageService } from "init";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import {
  trackMv3MigrationCompleted,
  trackMv3MigrationRulesMigrated,
  trackMv3MigrationStarted,
} from "modules/analytics/events/migrations";
import Logger from "lib/logger";
import * as semver from "semver";

const MV3_MIGRATION_DATA = "mv3MigrationData";

export enum RuleMigrationChange {
  SOURCE_PATH_MIGRATED = "source_path_migrated",
  SOURCE_PAGEURL_MIGRATED = "source_pageUrl_migrated",
}

export const LATEST_RULES_SCHEMA_VERSION = {
  [RuleType.REDIRECT]: "3.0.0",
  [RuleType.CANCEL]: "3.0.0",
  [RuleType.REPLACE]: "3.0.1",
  [RuleType.HEADERS]: "3.0.0",
  [RuleType.USERAGENT]: "3.0.0",
  [RuleType.SCRIPT]: "3.0.0",
  [RuleType.QUERYPARAM]: "3.0.0",
  [RuleType.RESPONSE]: "3.0.0",
  [RuleType.REQUEST]: "3.0.0",
  [RuleType.DELAY]: "3.0.0",
};

export const migrateAllRulesToMV3 = (rules: Rule[], currentWorkspaceId: string): Rule[] => {
  // return rules;
  if (!window.isFirstSyncComplete) {
    return rules;
  }

  Logger.log("[Debug][MV3.migrateAllRulesToMV3] Rules Migration started", {
    rules,
    isFirstSyncComplete: window.isFirstSyncComplete,
    currentWorkspaceId,
  });
  trackMv3MigrationStarted(rules.length);
  const rulesMigrationLogs: Record<string, any> = {};
  const migratedRules: Rule[] = [];

  const urlParams = new URLSearchParams(window.location.search);
  const forceMigrate = urlParams.get("updatedToMv3") != null;

  let pathImpactedRulesCount = 0;
  let pageUrlImpactedRulesCount = 0;

  const finalRules = rules.map((rule) => {
    const {
      rule: migratedRule,
      ruleMigrationLogs,
      isMigrated,
      isPathImpactedRule,
      isPageUrlImpactedRule,
    } = migrateRuleToMV3(rule, forceMigrate);
    if (ruleMigrationLogs) {
      rulesMigrationLogs[migratedRule.id] = ruleMigrationLogs;
      pathImpactedRulesCount += isPathImpactedRule ? 1 : 0;
      pageUrlImpactedRulesCount += isPageUrlImpactedRule ? 1 : 0;
    }

    if (isMigrated) {
      migratedRules.push(migratedRule);
    }
    return migratedRule;
  });

  const workspaceId = currentWorkspaceId ? currentWorkspaceId : null;
  const migrationData = getMV3MigrationData() || {};
  const currentWorkspaceMigrationData = migrationData[workspaceId ? workspaceId : "private"];

  if (migratedRules.length > 0) {
    Logger.log("[Debug][MV3.migrateAllRulesToMV3] Saving Migrated Rules", { migratedRules, currentWorkspaceId });

    // NOTE: Batching retriggers the syncing everytime time. So refrain from making this smaller.
    const MIGRATION_BATCH = 100;
    const migrationPromises = [];
    for (let i = 0; i < migratedRules.length; i += MIGRATION_BATCH) {
      migrationPromises.push(
        StorageService(GLOBAL_CONSTANTS.APP_MODES.EXTENSION).saveMultipleRulesOrGroups(
          migratedRules.slice(i, i + MIGRATION_BATCH),
          { workspaceId: workspaceId }
        )
      );
    }

    Promise.all(migrationPromises).then((results) => {
      saveMV3MigrationData({
        ...migrationData,
        [workspaceId ? workspaceId : "private"]: {
          rulesMigrationLogs: { ...currentWorkspaceMigrationData?.rulesMigrationLogs, ...rulesMigrationLogs },
        },
      });
      Logger.log("[Debug][MV3.migrateAllRulesToMV3] Rules Migrated Successfully", { migratedRules, results });
      trackMv3MigrationRulesMigrated(
        rules.length,
        migratedRules.length,
        rulesMigrationLogs ? Object.keys(rulesMigrationLogs).length : 0,
        pathImpactedRulesCount,
        pageUrlImpactedRulesCount
      );
    });
  }

  trackMv3MigrationCompleted(rules.length, migratedRules.length);
  Logger.log("[Debug][MV3.migrateAllRulesToMV3] Rules Migration ended", {
    currentWorkspaceMigrationData,
    rulesMigrationLogs,
    migratedRules,
    finalRules,
  });

  return finalRules;
};

export const migrateRuleToMV3 = (
  rule: Rule,
  forceMigrate = false
): {
  isMigrated: boolean;
  rule: Rule;
  ruleMigrationLogs: any;
  isPathImpactedRule?: boolean;
  isPageUrlImpactedRule?: boolean;
} => {
  if (
    rule?.schemaVersion &&
    semver.gte(rule?.schemaVersion as string, LATEST_RULES_SCHEMA_VERSION[rule.ruleType]) &&
    !forceMigrate
  ) {
    return {
      isMigrated: false,
      rule,
      ruleMigrationLogs: null,
    };
  }

  const ruleMigrationLogs: Record<string, any>[] = [];
  Logger.log("[Debug][MV3.migrateRuleToMV3] Rule Migration Started", {
    currentVersion: rule?.schemaVersion,
    latestVersion: LATEST_RULES_SCHEMA_VERSION[rule.ruleType],
    rule,
    forceMigrate,
  });

  let isPathImpactedRule = false;
  let isPageUrlImpactedRule = false;

  rule.pairs.forEach((pair) => {
    const pathMigrationStatus = migratePathOperator(pair.source);
    if (pathMigrationStatus) {
      ruleMigrationLogs.push(pathMigrationStatus);
      isPathImpactedRule = true;
    }

    const pageUrlMigrationStatus = migratePageURLtoPageDomain(pair.source);
    if (pageUrlMigrationStatus) {
      ruleMigrationLogs.push(pageUrlMigrationStatus);
      isPageUrlImpactedRule = true;
    }
  });

  const finalRule = {
    ...rule,
    extensionRules: parseDNRRules(rule),
    schemaVersion: LATEST_RULES_SCHEMA_VERSION[rule.ruleType],
  };

  Logger.log("[Debug][MV3.migrateRuleToMV3] Rule Migration Ended", { finalRule, ruleMigrationLogs });

  return {
    isMigrated: true,
    rule: finalRule,
    ruleMigrationLogs: ruleMigrationLogs.length ? ruleMigrationLogs : null,
    isPathImpactedRule: isPathImpactedRule,
    isPageUrlImpactedRule: isPageUrlImpactedRule,
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
