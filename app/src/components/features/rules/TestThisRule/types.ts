export type TestReport = {
  id: string;
  url: string;
  ruleId: string;
  timestamp: number;
  appliedStatus: boolean;
  sessionLink?: string;
  isSessionSaving?: boolean;
};
