export interface IAnalyticsIntegration {
  enabled: boolean;
  isIntegrationDone: boolean;
  startTime: number;
  groupId?: string | null;
  init: (user: any) => void;
  trackEvent: (eventName: string, eventParams: any, retry?: number) => void;
  trackAttr: (name: string, value: string, retry?: number) => void;
  onGroupChange?: (groupId: string, groupName: string) => void;
}
