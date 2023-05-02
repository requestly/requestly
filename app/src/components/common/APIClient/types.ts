import { RequestMethod } from "views/features/apis/types";

export interface APIClientRequest {
  url: string;
  headers?: Record<string, string>;
  method?: RequestMethod;
  body?: string | FormData;
}
