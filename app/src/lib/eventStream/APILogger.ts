import { EventLogger } from "./EventLogger";
import { APIClientEvent } from "features/apiClient/eventStream/types";
import { cloneDeep } from "lodash";
import { reduxStore } from "store";
import { eventsSlice } from "store/slices/eventsStream/slice";

class APILogger extends EventLogger {
  pushEvent(event: APIClientEvent): void {
    reduxStore.dispatch(eventsSlice.actions.eventAdd(cloneDeep(event)));
  }
}

export const APIEventLogger = new APILogger();
