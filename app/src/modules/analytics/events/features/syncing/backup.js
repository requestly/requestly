import { trackEvent } from "modules/analytics";
import { SYNCING } from "../constants";

export const trackBackupCreated = () => {
  const params = {};
  trackEvent(SYNCING.BACKUP.CREATED, params);
};

export const trackBackupRollbacked = (backup_index) => {
  const params = { backup_index };
  trackEvent(SYNCING.BACKUP.ROLLBACKED, params);
};

export const trackBackupToggled = (value) => {
  const params = { value };
  trackEvent(SYNCING.BACKUP.TOGGLED, params);
};
