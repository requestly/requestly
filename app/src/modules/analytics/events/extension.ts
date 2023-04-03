import { trackEvent } from "..";
// @ts-ignore
import { CONSTANTS } from "@requestly/requestly-core";

interface Event {
  eventName: string;
  eventParams: object;
  eventTs: number;
}

interface EventBatch {
  id: string;
  events: Event[];
  createdTs: number;
}
function sendEventsBatch(eventBatch: EventBatch) {
  eventBatch.events.forEach((event) => {
    const eventConfig = { time: event.eventTs };
    console.log(
      "!!!debug",
      "trackEvent",
      event.eventName,
      event.eventParams,
      eventConfig
    );
    trackEvent(event.eventName, event.eventParams, eventConfig);
  });
}

export function handleEventBatches(batches: EventBatch[]) {
  batches.forEach(sendEventsBatch);
}

/* EXTENSION EVENTS ENGINE FLAG */
export const getEventsEngineFlag = {
  [CONSTANTS.STORAGE_KEYS.USE_EVENTS_ENGINE]: true,
};
