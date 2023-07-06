import { FileType } from "../types";

// Remove leading & trailing slash
export const cleanupEndpoint = (endpoint: string) => {
  let cleanedEndpoint = endpoint.replace(/^\/+|\/+$/g, "");
  return cleanedEndpoint;
};

export const validateEndpoint = (endpoint: string) => {
  if (!endpoint) {
    return "Endpoint is required";
  }

  if (endpoint.startsWith("/")) {
    return "Endpoint cannot start with '/'";
  }

  if (endpoint.endsWith("/")) {
    return "Endpoint cannot end with '/'";
  }

  const pattern = /^[A-Za-z0-9_.\-/]+$/;
  if (endpoint.match(pattern)) {
    return null;
  } else {
    return "Endpoint can only contain letters, numbers, '_', '-' & '/'";
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
      return "javascript";
    case FileType.CSS:
      return "css";
    case FileType.HTML:
      return "html";
    default:
      return "json";
  }
};
