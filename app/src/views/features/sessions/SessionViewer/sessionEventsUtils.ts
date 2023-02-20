import { strFromU8, strToU8, zlibSync, unzlibSync } from "fflate";
import {
  NetworkEventData,
  RQSessionEvents,
  RQSessionEventType,
} from "@requestly/web-sdk";

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
