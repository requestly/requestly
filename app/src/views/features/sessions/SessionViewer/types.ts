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
  isRequestedByAuthor?: boolean;
  eventsFilePath?: string;
  visibility?: Visibility;
  accessEmails?: string[];
  name?: string;
  sessionAttributes: RQSessionAttributes;
  author?: string;
  filePath?: string;
  startTimeOffset?: number;
  description?: string;
  metadata?: SessionMetadataOptions;
}

export interface SessionMetadataOptions {
  networkLogs: boolean;
  consoleLogs: boolean;
}

export interface ConsoleLog extends LogData {
  timeOffset: number;
}

export interface NetworkLog extends NetworkEventData {
  timeOffset: number;
}
