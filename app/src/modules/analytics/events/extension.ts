import { trackEvent } from "..";

interface Event {
  eventName: string;
  eventParam: object;
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
    trackEvent(event.eventName, event.eventParam, eventConfig);
  });
}

export function handleEventBatches(batches: EventBatch[]) {
  batches.forEach(sendEventsBatch);
}
