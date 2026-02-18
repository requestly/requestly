import { EventLogger } from "./EventLogger";
import { APIClientEvent } from "features/apiClient/eventStream/types";
import { reduxStore } from "store";
import { eventsSlice } from "store/slices/eventsStream/slice";

class APILogger extends EventLogger {
  pushEvent(event: APIClientEvent): void {
    const eventCopy = JSON.parse(JSON.stringify(event));
    reduxStore.dispatch(eventsSlice.actions.eventAdd(eventCopy));
  }
}

export const APIEventLogger = new APILogger();
