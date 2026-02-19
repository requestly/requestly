import { Iteration } from "../slices/common/runResults";
import { ExecutionId, RQAPI } from "../types";
import type { Workspace } from "features/workspaces/types";

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

type RecordTag = { recordId: RQAPI.ApiClientRecord["id"] };
type IterationTag = { iteration: Iteration };
type ExecutionTag = { executionId: ExecutionId };

export type Tag = Partial<RecordTag & IterationTag & ExecutionTag>;

export interface APIClientEvent {
  id: string;
  timestamp: number;
  flow: EventFlow;
  workspaceId: Workspace["id"];
  tag: Tag;
  data: APIClientEventData;
  _ctx?: any; // static context. Eg. execution env details, variable snapshot, etc.
}
