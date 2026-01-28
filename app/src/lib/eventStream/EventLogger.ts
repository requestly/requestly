import { RequestEventData } from "@sentry/react";
import { APIClientEvent, EventFlow, ResponseEventData, Tag } from "features/apiClient/eventStream/types";
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
        // @ts-ignore poc-ing
        // TODO: Remove ts-ignore and resolve issue
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
