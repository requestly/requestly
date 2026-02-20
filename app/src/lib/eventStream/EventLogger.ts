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

  logRequest(params: { request: RequestEventData["payload"]; tag?: Tag; workspaceId: APIClientEvent["workspaceId"] }) {
    const event: APIClientEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      workspaceId: params.workspaceId,
      tag: params.tag ?? {},
      flow: EventFlow.API_EXECUTION,
      data: {
        type: "REQUEST",
        payload: params.request,
      },
    };
    this.pushEvent(event);
  }
  logResponse(params: {
    response: ResponseEventData["payload"];
    tag?: Tag;
    workspaceId: APIClientEvent["workspaceId"];
  }) {
    const event: APIClientEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      workspaceId: params.workspaceId,
      tag: params.tag ?? {},
      flow: EventFlow.API_EXECUTION,
      data: {
        type: "RESPONSE",
        payload: params.response,
      },
    };
    this.pushEvent(event);
  }
}
