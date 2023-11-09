import { strFromU8, strToU8, zlibSync, unzlibSync } from "fflate";
import { NetworkEventData, RQSessionEvents, RQSessionEventType, RRWebEventData } from "@requestly/web-sdk";
import { ConsoleLog, DebugInfo, PageNavigationLog, RecordingOptions, SessionRecordingMetadata } from "./types";
import { EventType, IncrementalSource, LogData } from "rrweb";
import { EXPORTED_SESSION_FILE_EXTENSION, SESSION_EXPORT_TYPE } from "./constants";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import fileDownload from "js-file-download";

const MAX_ALLOWED_NETWORK_RESPONSE_SIZE = 20 * 1024; // 20KB

export const compressEvents = (events: RQSessionEvents): string => {
  return strFromU8(zlibSync(strToU8(JSON.stringify(events))), true);
};

export const decompressEvents = (compressedEvents: string): RQSessionEvents => {
  return JSON.parse(strFromU8(unzlibSync(strToU8(compressedEvents, true))));
};

export const filterOutLargeNetworkResponses = (events: RQSessionEvents): void => {
  const networkEvents = events[RQSessionEventType.NETWORK] as NetworkEventData[];
  networkEvents?.forEach((networkEvent) => {
    if (JSON.stringify(networkEvent.response)?.length > MAX_ALLOWED_NETWORK_RESPONSE_SIZE) {
      networkEvent.response = "Response too large";
    }
  });
};

const isConsoleLogEvent = (rrwebEvent: RRWebEventData): boolean => {
  if (rrwebEvent.type === EventType.IncrementalSnapshot) {
    //@ts-ignore
    return rrwebEvent.data.source === IncrementalSource.Log;
  }
  if (rrwebEvent.type === EventType.Plugin) {
    return rrwebEvent.data.plugin === "rrweb/console@1";
  }

  return false;
};

export const getPageNavigationLogs = (rrwebEvents: RRWebEventData[], startTime: number): PageNavigationLog[] => {
  return rrwebEvents
    .filter((event) => event.type === EventType.Meta && event.data.href)
    .map((metaEvent) => {
      return {
        // @ts-ignore
        ...metaEvent.data,
        timestamp: metaEvent.timestamp,
        timeOffset: Math.ceil((metaEvent.timestamp - startTime) / 1000),
      };
    });
};

export const getConsoleLogs = (rrwebEvents: RRWebEventData[], startTime: number): ConsoleLog[] => {
  return rrwebEvents
    .map((event, index) => {
      let logData: LogData = null;
      if (isConsoleLogEvent(event)) {
        if (event.type === EventType.IncrementalSnapshot) {
          logData = (event.data as unknown) as LogData;
        } else if (event.type === EventType.Plugin) {
          logData = event.data.payload as LogData;
        }
      }

      return (
        logData && {
          ...logData,
          id: `resource-${index}`,
          timeOffset: (event.timestamp - startTime) / 1000,
        }
      );
    })
    .filter((event) => !!event);
};

export const filterOutConsoleLogs = (rrwebEvents: RRWebEventData[]): RRWebEventData[] => {
  return rrwebEvents.filter((event) => !isConsoleLogEvent(event));
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

export const getSessionEventsToSave = (sessionEvents: RQSessionEvents, options: RecordingOptions): RQSessionEvents => {
  const filteredSessionEvents: RQSessionEvents = {
    [RQSessionEventType.RRWEB]: sessionEvents[RQSessionEventType.RRWEB],
    [RQSessionEventType.NETWORK]: sessionEvents[RQSessionEventType.NETWORK],
  };

  if (options.includeNetworkLogs === false) {
    delete filteredSessionEvents[RQSessionEventType.NETWORK];
  }

  if (options.includeConsoleLogs === false) {
    const filteredRRWebEvent = filterOutConsoleLogs(sessionEvents[RQSessionEventType.RRWEB] as RRWebEventData[]);
    filteredSessionEvents[RQSessionEventType.RRWEB] = filteredRRWebEvent;
  }

  return filteredSessionEvents;
};

export const prepareSessionToExport = (events: string, metadata: SessionRecordingMetadata): Promise<string> => {
  const sessionToExport = {
    version: 1,
    type: SESSION_EXPORT_TYPE,
    data: { events, metadata },
  };

  return new Promise((resolve) => resolve(JSON.stringify(sessionToExport)));
};

export const downloadSession = (fileContent: string, fileName: string): void => {
  fileDownload(fileContent, `${fileName}.${EXPORTED_SESSION_FILE_EXTENSION}`);
};

export const getSessionRecordingOptions = (options: RecordingOptions): string[] => {
  return Object.keys(options ?? {}).filter((key: DebugInfo) => options?.[key]);
};

export function isUserInteractionEvent(event: RRWebEventData): boolean {
  if (event.type !== EventType.IncrementalSnapshot) {
    return false;
  }
  return event.data.source > IncrementalSource.Mutation && event.data.source <= IncrementalSource.Input;
}

export const getInactiveSegments = (events: RRWebEventData[]): [number, number][] => {
  const SKIP_TIME_THRESHOLD = 10 * 1000;
  const inactiveSegments: [number, number][] = [];
  let lastActiveTime = events[0].timestamp;

  events.forEach((event) => {
    if (!isUserInteractionEvent(event)) {
      return;
    }
    if (event.timestamp - lastActiveTime > SKIP_TIME_THRESHOLD) {
      inactiveSegments.push([lastActiveTime, event.timestamp]);
    }
    lastActiveTime = event.timestamp;
  });

  return inactiveSegments;
};
