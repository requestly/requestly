import { RequestMethod } from "features/api-client/types";

export interface APIClientRequest {
  url: string;
  headers?: Record<string, string>;
  method?: string | RequestMethod;
  body?: string | FormData;
}
