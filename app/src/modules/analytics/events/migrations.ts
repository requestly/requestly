import { trackEvent } from "..";

export const trackMv3MigrationStarted = (total_count: number) => {
  trackEvent("mv3_migration_started", { total_count });
};

export const trackMv3MigrationRulesMigrated = (
  total_count: number,
  migrated_count: number,
  impacted_count: number,
  path_impacted_count: number,
  page_url_impacted_count: number
) => {
  trackEvent("mv3_migration_rules_migrated", {
    total_count,
    migrated_count,
    impacted_count,
    path_impacted_count,
    page_url_impacted_count,
  });
};

export const trackMv3MigrationCompleted = (total_count: number, migrated_count: number) => {
  trackEvent("mv3_migration_completed", { total_count, migrated_count });
};
