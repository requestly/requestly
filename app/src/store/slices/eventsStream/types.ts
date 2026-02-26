import { eventsAdapter } from "./slice";

export type EventsSliceState = {
  events: ReturnType<typeof eventsAdapter.getInitialState>;
};
