import { RQAPI } from "features/apiClient/types";

export enum ApiClientEventTopic {
  AUTH_CHANGED = "authChanged",
  CHILD_ADDED = "childAdded",
}

export interface ApiClientEvent {
  topic: ApiClientEventTopic;
  emitterId: RQAPI.ApiClientRecord["id"];
}
