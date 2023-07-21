import { SourceKey, SourceOperator } from "types";

export enum AutoRecordingMode {
  CUSTOM = "custom",
  ALL_PAGES = "allPages",
}

export type PageSource = {
  id?: string;
  key: SourceKey;
  value: string;
  isActive: boolean;
  operator: SourceOperator;
};

export type SessionRecordingConfig = {
  maxDuration?: number;
  pageSources?: PageSource[];
  autoRecording?: {
    isActive: boolean;
    mode: AutoRecordingMode;
  };
};
