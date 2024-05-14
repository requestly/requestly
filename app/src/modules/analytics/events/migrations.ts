import { trackEvent } from "..";

export const trackMv3MigrationStarted = (rulesCount: number) => {
  trackEvent("mv3_migration_started", { rulesCount });
};

export const trackMv3MigrationCompleted = (rulesCount: number) => {
  trackEvent("mv3_migration_completed", { rulesCount });
};
