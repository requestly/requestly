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

const sendEventsBatch = (eventBatch: EventBatch): void => {
  eventBatch.events.forEach((event) => {
    const eventConfig = { time: event.eventTs };
    trackEvent(event.eventName, event.eventParams, eventConfig);
  });
};

/**
 *
 * @param batches event batches
 * @returns processed batch IDs to acknowledge
 */
export const handleEventBatches = (batches: EventBatch[]): string[] => {
  batches.forEach(sendEventsBatch);
  return batches.map((batch) => batch.id);
};

/* EXTENSION EVENTS ENGINE FLAG */
export const getEventsEngineFlag = {
  [CONSTANTS.STORAGE_KEYS.USE_EVENTS_ENGINE]: true,
  [CONSTANTS.STORAGE_KEYS.SEND_EXECUTION_EVENTS]: true,
};
