import { RRWebEventData } from "@requestly/web-sdk";
import { EventType, IncrementalSource } from "@rrweb/types";

export function isUserInteraction(event: RRWebEventData): boolean {
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
    if (!isUserInteraction(event)) {
      return;
    }
    if (event.timestamp - lastActiveTime > SKIP_TIME_THRESHOLD) {
      inactiveSegments.push([lastActiveTime, event.timestamp]);
    }
    lastActiveTime = event.timestamp;
  });

  return inactiveSegments;
};
