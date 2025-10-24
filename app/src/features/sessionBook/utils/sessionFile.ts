import { RQSessionEvents } from "@requestly/web-sdk";
import { DebugInfo, RecordingOptions, SessionRecordingMetadata } from "../types";
import { compressEvents, getSessionEventsToSave } from "./sessionEvents";
import { EXPORTED_SESSION_FILE_EXTENSION, SESSION_EXPORT_TYPE } from "../constants";
import fileDownload from "js-file-download";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import Logger from "lib/logger";

const prepareSessionToExport = (events: string, metadata: SessionRecordingMetadata): Promise<string> => {
  const sessionToExport = {
    version: 1,
    type: SESSION_EXPORT_TYPE,
    data: { events, metadata },
  };

  return new Promise((resolve) => resolve(JSON.stringify(sessionToExport)));
};

const downloadSession = (fileContent: string, fileName: string): void => {
  fileDownload(fileContent, `${fileName}.${EXPORTED_SESSION_FILE_EXTENSION}`);
};

export const downloadSessionFile = async (
  events: RQSessionEvents,
  metadata: SessionRecordingMetadata,
  recordingOptions: RecordingOptions
) => {
  const sessionEvents = compressEvents(getSessionEventsToSave(events, recordingOptions));
  const sessionMetadata = {
    name: metadata.name,
    options: { ...recordingOptions },
    sessionAttributes: { ...metadata.sessionAttributes },
    recordingMode: metadata?.recordingMode || null,
  };

  return prepareSessionToExport(sessionEvents, metadata)
    .then((fileContent) => downloadSession(fileContent, sessionMetadata.name))
    .catch((error) => {
      Logger.error("Failed to download session file", error);
    });
};

export const getSessionRecordingOptions = (options: RecordingOptions): string[] => {
  return Object.keys(options ?? {}).filter((key: DebugInfo) => options?.[key]);
};

export const getRecordingOptionsToSave = (includedDebugInfo: CheckboxValueType[]): RecordingOptions => {
  const recordingOptions: RecordingOptions = {
    includeConsoleLogs: true,
    includeNetworkLogs: true,
  };

  let option: keyof RecordingOptions;
  for (option in recordingOptions) {
    recordingOptions[option] = includedDebugInfo.includes(option);
  }

  return recordingOptions;
};
