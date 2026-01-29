import { useDispatch } from "react-redux";
import { APIClientEvent, EventFlow, eventsActions, RequestEventData, ResponseEventData, Tag } from "./slice";
import { uuidv4 } from "zod/v4";

export abstract class EventLogger {
  // will have methods to log for every execution stage
  // Each platform can choose how to implement this, can be a simple dispatch, or
  // can be a daisy chain of relays.
  abstract pushEvent(event: APIClientEvent): void;
  //   readonly workspaceId: WorkspaceId;
  logRequest(params: { request: RequestEventData; tag?: Tag }) {
    const event: APIClientEvent = {
      id: uuidv4().toString(),
      timestamp: Date.now(),
      tag: params.tag ?? {},
      //   workspaceId: this.workspaceId,
      flow: EventFlow.API_EXECUTION,
      data: {
        type: "REQUEST",
        payload: params.request.payload,
      },
    };
    this.pushEvent(event);
  }
  logResponse(params: { response: ResponseEventData; tag?: Tag }) {
    const event: APIClientEvent = {
      id: uuidv4().toString(),
      timestamp: Date.now(),
      tag: params.tag ?? {},
      //   workspaceId: this.workspaceId,
      flow: EventFlow.API_EXECUTION,
      data: {
        type: "RESPONSE",
        payload: params.response.payload,
      },
    };
    this.pushEvent(event);
  }
}

export class APILogger extends EventLogger {
  private dispatch: ReturnType<typeof useDispatch>;

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


