/* eslint-disable no-unused-vars */
import { NetworkEventData, RQSessionAttributes } from "@requestly/web-sdk";
import { LogData } from "rrweb";

export enum Visibility {
  ONLY_ME = "only-me",
  PUBLIC = "public",
  CUSTOM = "custom",
  ORGANIZATION = "organization",
}

export interface SessionRecording {
  id?: string;
  isRequestedByOwner?: boolean;
  eventsFilePath?: string;
  visibility?: Visibility;
  accessEmails?: string[];
  name?: string;
  sessionAttributes: RQSessionAttributes;
  createdBy?: string;
  ownerId?: string;
  filePath?: string;
  startTimeOffset?: number;
  description?: string;
  options?: RecordingOptions;
  createdTs?: number;
  updatedTs?: number;
  lastUpdatedBy?: string;
}

export interface RecordingOptions {
  includeNetworkLogs: boolean;
  includeConsoleLogs: boolean;
}

export interface ConsoleLog extends LogData {
  timeOffset: number;
}

export interface NetworkLog extends NetworkEventData {
  timeOffset: number;
}

export type SessionRecordingExportData = {
  events: string;
  payload: SessionRecording;
  options: RecordingOptions;
};
