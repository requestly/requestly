/* eslint-disable no-unused-vars */
import { NetworkEventData, RQSessionAttributes } from "@requestly/web-sdk";
import { LogData } from "rrweb";

export enum SessionSaveMode {
  LOCAL = "local",
  ONLINE = "online",
}

export enum DebugInfo {
  INCLUDE_NETWORK_LOGS = "includeNetworkLogs",
  INCLUDE_CONSOLE_LOGS = "includeConsoleLogs",
}

export enum Visibility {
  ONLY_ME = "only-me",
  PUBLIC = "public",
  CUSTOM = "custom",
  ORGANIZATION = "organization",
}

export interface SessionRecordingMetadata {
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
  recordingMode?: SessionRecordingMode;
}

export interface RecordingOptions {
  includeNetworkLogs: boolean;
  includeConsoleLogs: boolean;
}

export interface ConsoleLog extends LogData {
  timeOffset: number;
  id: string;
}

export interface NetworkLog extends NetworkEventData {
  timeOffset: number;
}

export interface PageNavigationLog {
  href: string;
  width: number;
  height: number;
  timestamp: number;
  timeOffset: number;
}

export enum PlayerState {
  PLAYING = "playing",
  PAUSED = "paused",
  SKIPPING = "skipping",
}

export enum SessionRecordingMode {
  AUTO = "auto",
  MANUAL = "manual",
}
