import {
  APIClientEvent,
  EventFlow,
  RequestEventData,
  ResponseEventData,
  Tag,
} from "features/apiClient/eventStream/types";
import { v4 as uuidv4 } from "uuid";

export abstract class EventLogger {
  abstract pushEvent(event: APIClientEvent): void;
  logRequest(params: { request: RequestEventData["payload"]; tag?: Tag }) {
    const event: APIClientEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      tag: params.tag ?? {},
      //   workspaceId: this.workspaceId,
      flow: EventFlow.API_EXECUTION,
      data: {
        type: "REQUEST",
        payload: params.request,
      },
    };
    this.pushEvent(event);
  }
  logResponse(params: { response: ResponseEventData["payload"]; tag?: Tag }) {
    const event: APIClientEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      tag: params.tag ?? {},
      //   workspaceId: this.workspaceId,
      flow: EventFlow.API_EXECUTION,
      data: {
        type: "RESPONSE",
        payload: params.response,
      },
    };
    this.pushEvent(event);
  }
}
