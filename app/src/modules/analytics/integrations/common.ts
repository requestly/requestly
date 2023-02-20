export interface IAnalyticsIntegration {
  enabled: boolean;
  isIntegrationDone: boolean;
  startTime: number;
  init: (user: any) => void;
  trackEvent: (eventName: string, eventParams: any, retry?: number) => void;
  trackAttr: (name: string, value: string, retry?: number) => void;
}
