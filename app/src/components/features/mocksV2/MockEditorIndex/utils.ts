import { EditorLanguage } from "componentsV2/CodeEditor";
import { FileType } from "../types";

// Remove leading & trailing slash
export const cleanupEndpoint = (endpoint: string) => {
  let cleanedEndpoint = endpoint.replace(/^\/+|\/+$/g, "");
  return cleanedEndpoint;
};

export const validateHeaders = (headers: { [key: string]: string }) => {
  const ACCEPTED_CONTENT_TYPES = ["application/json", "text/plain"];
  if (!Object.keys(headers).length) return null;

  const contentType = headers["Content-Type"] || headers["content-type"];

  if (contentType && !ACCEPTED_CONTENT_TYPES.includes(contentType)) {
    return "Only application/json or text/plain are allowed as content-type";
  }
  return null;
};

export const validateEndpoint = (endpoint: string, messagePrefix = "Endpoint") => {
  if (!endpoint) {
    return `${messagePrefix} is required`;
  }

  if (endpoint.startsWith("/")) {
    return `${messagePrefix} cannot start with '/'`;
  }

  if (endpoint.endsWith("/")) {
    return `${messagePrefix} cannot end with '/'`;
  }

  const pattern = /^[A-Za-z0-9_:.\-/]+$/;
  if (endpoint.match(pattern)) {
    return null;
  } else {
    return `${messagePrefix} can only contain letters, numbers, '_', '-' & '/'`;
  }
};

export const validateStatusCode = (statusCode: string) => {
  if (!statusCode) return "Status code is required";

  const pattern = /^\d{3}$/;
  if (!statusCode.match(pattern)) return "Invalid status code";

  return null;
};

export const getEditorLanguage = (fileType?: FileType) => {
  switch (fileType) {
    case FileType.JS:
      return EditorLanguage.JAVASCRIPT;
    case FileType.CSS:
      return EditorLanguage.CSS;
    case FileType.HTML:
      return EditorLanguage.HTML;
    default:
      return EditorLanguage.JSON;
  }
};
