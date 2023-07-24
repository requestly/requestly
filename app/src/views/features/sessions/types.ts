import { SessionRecordingPageSource } from "types/sessionRecording";

export enum AutoRecordingMode {
  CUSTOM = "custom",
  ALL_PAGES = "allPages",
}

export type SessionRecordingConfig = {
  maxDuration?: number;
  pageSources?: SessionRecordingPageSource[];
  autoRecording?: {
    isActive: boolean;
    mode: AutoRecordingMode;
  };
};
