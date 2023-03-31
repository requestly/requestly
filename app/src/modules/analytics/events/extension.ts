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
  const eventConfig = { time: eventBatch.createdTs };
  eventBatch.events.forEach((event) => {
    trackEvent(event.eventName, event.eventParam, eventConfig);
  });
}

export function handleEventBatches(batches: EventBatch[]) {
  batches.forEach(sendEventsBatch);
}
