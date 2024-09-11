import { strFromU8, strToU8, zlibSync, unzlibSync } from "fflate";
import { NetworkEventData, RQSessionEvents, RQSessionEventType, RRWebEventData } from "@requestly/web-sdk";
import { ConsoleLog, PageNavigationLog, RecordingOptions } from "../types";
import { EventType, IncrementalSource, LogData } from "rrweb";

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

export const getSessionEventsToSave = (sessionEvents: RQSessionEvents, options: RecordingOptions): RQSessionEvents => {
  const filteredSessionEvents: RQSessionEvents = {
    [RQSessionEventType.RRWEB]: sessionEvents[RQSessionEventType.RRWEB],
    [RQSessionEventType.NETWORK]: sessionEvents[RQSessionEventType.NETWORK],
    // TODO: Remove the 'storage' literal key once the SDK is updated
    // [RQSessionEventType.STORAGE]: sessionEvents[RQSessionEventType.STORAGE],
    storage: sessionEvents["storage"],
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
