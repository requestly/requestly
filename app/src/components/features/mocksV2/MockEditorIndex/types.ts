import { FileType, MockType } from "../types";

export interface MockEditorDataSchema {
  id: string;
  type?: MockType;
  fileType?: FileType | null;
  name: string;
  desc: string;
  method: RequestMethod;
  latency: number;
  endpoint: string;
  statusCode: number;
  contentType: string;
  headers: { [key: string]: string };
  body: string;
  responseId?: string; // Keeping it separate as we only support 1 response
  password?: string;
  collectionId?: string;
  // TODO: Response should ideally be an array
}

export interface ValidationErrors {
  name?: string;
  statusCode?: string;
  endpoint?: string;
  headers?: string;
}

// TODO: Remove this. Fetch this from @requestly/mock-server or APP_CONSTANTS
/* eslint-disable no-unused-vars */
export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}
/* eslint-enable no-unused-vars */
