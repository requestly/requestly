import { strFromU8, strToU8, zlibSync, unzlibSync } from "fflate";
import {
  NetworkEventData,
  RQSessionEvents,
  RQSessionEventType,
  RRWebEventData,
} from "@requestly/web-sdk";
import { ConsoleLog } from "./types";
import { EventType, IncrementalSource, LogData } from "rrweb";

const MAX_ALLOWED_NETWORK_RESPONSE_SIZE = 20 * 1024; // 20KB

export const compressEvents = (events: RQSessionEvents): string => {
  return strFromU8(zlibSync(strToU8(JSON.stringify(events))), true);
};

export const decompressEvents = (compressedEvents: string): RQSessionEvents => {
  return JSON.parse(strFromU8(unzlibSync(strToU8(compressedEvents, true))));
};

export const filterOutLargeNetworkResponses = (
  events: RQSessionEvents
): void => {
  const networkEvents = events[
    RQSessionEventType.NETWORK
  ] as NetworkEventData[];
  networkEvents?.forEach((networkEvent) => {
    if (
      JSON.stringify(networkEvent.response)?.length >
      MAX_ALLOWED_NETWORK_RESPONSE_SIZE
    ) {
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

export const getConsoleLogs = (
  rrwebEvents: RRWebEventData[],
  startTime: number
): ConsoleLog[] => {
  return rrwebEvents
    .map((event) => {
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
          timeOffset: Math.floor((event.timestamp - startTime) / 1000),
        }
      );
    })
    .filter((event) => !!event);
};

export const filterOutConsoleLogs = (
  rrwebEvents: RRWebEventData[]
): RRWebEventData[] => {
  return rrwebEvents.filter((event) => !isConsoleLogEvent(event));
};
