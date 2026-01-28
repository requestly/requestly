import { useDispatch } from "react-redux";
import { EventLogger } from "./EventLogger";
import { APIClientEvent } from "features/apiClient/eventStream/types";
import { eventsActions } from "store/slices/eventsStream/slice";

export class APILogger extends EventLogger {
  private dispatch: ReturnType<typeof useDispatch>;

  // TODO: Figure out a way to do this without having to pass dispatch
  constructor(dispatch: ReturnType<typeof useDispatch>) {
    super();
    this.dispatch = dispatch;
  }

  pushEvent(event: APIClientEvent): void {
    this.dispatch(eventsActions.eventAdd(event));
  }
}

// Hook to create an APILogger instance with dispatch
export const useAPILogger = (): APILogger => {
  const dispatch = useDispatch();
  return new APILogger(dispatch);
};
