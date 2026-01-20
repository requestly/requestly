import { trackEvent } from "modules/analytics";

const APP_NOTIFICATION = {
  VIEWED: "app_notification_viewed",
  CLICKED: "app_notification_clicked",
  FORCE_RELOAD: "app_update_force_reload",
};

type NotificationType = "app_update";
type ActionOnNotification = "close" | "app_refresh";

export const trackAppUpdateNotificationViewed = (notificationType: NotificationType) => {
  trackEvent(APP_NOTIFICATION.VIEWED, { notification_type: notificationType });
};

export const trackAppUpdateNotificationClicked = (notificationType: NotificationType, action: ActionOnNotification) => {
  trackEvent(APP_NOTIFICATION.CLICKED, { notification_type: notificationType, action });
};

export const trackAppUpdateForceReload = (currentVersion: string, breakingAppVersion: string) => {
  trackEvent(APP_NOTIFICATION.FORCE_RELOAD, { current_version: currentVersion, breaking_version: breakingAppVersion });
};
