import { RQAPI } from "features/apiClient/types";

export enum ApiClientEventTopic {
  AUTH_CHANGED = "authChanged",
  TREE_CHANGED = "treeChanged",
}

export interface ApiClientEvent {
  topic: ApiClientEventTopic;
  emitterId: RQAPI.ApiClientRecord["id"];
}
