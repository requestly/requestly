import { RQAPI } from "../types";

export enum EventFlow {
  API_EXECUTION = "API_EXECUTION",
}

export interface RequestEventData {
  type: "REQUEST";
  payload: RQAPI.Request;
}
export interface ResponseEventData {
  type: "RESPONSE";
  payload: RQAPI.Response;
}

type APIClientEventData = RequestEventData | ResponseEventData;

type RecordTag = { recordId: string };
type IterationTag = { iteration: number };
export type Tag = Partial<RecordTag & IterationTag>;

export interface APIClientEvent {
  id: string;
  timestamp: number;
  flow: EventFlow;
  //   workspaceId: WorkspaceId;
  tag: Tag;
  data: APIClientEventData;
  _ctx?: any; // static context. Eg. execution env details, variable snapshot, etc.
}
