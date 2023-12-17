import HEADER_SUGGESTIONS from "config/constants/sub/header-suggestions";
import { FileType } from "../types";
interface HeaderError {
  typeOfError: "name" | "value";
  description: string;
  errorIndex: number;
}

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

export const validateHeaders = (
  headerItems: Array<{ name: string; value: { name: string; value: string } }>
): HeaderError[] => {
  const headerErrors: HeaderError[] = [];
  const seenHeaderNames = new Set<string>();

  headerItems.forEach((headerWrapper, index) => {
    const headerName = headerWrapper.value.name;
    const headerValue = headerWrapper.value.value;

    if (!headerName) {
      headerErrors.push({ typeOfError: "name", description: "Header name is required", errorIndex: index });
    } else if (!HEADER_SUGGESTIONS.Response.some((option) => option.value.toLowerCase() === headerName.toLowerCase())) {
      headerErrors.push({ typeOfError: "name", description: "Invalid Header name", errorIndex: index });
    } else if (seenHeaderNames.has(headerName.toLowerCase())) {
      headerErrors.push({ typeOfError: "name", description: "Duplicate Header name", errorIndex: index });
    } else {
      seenHeaderNames.add(headerName.toLowerCase());
    }

    if (!headerValue) {
      headerErrors.push({ typeOfError: "value", description: "Header value is required", errorIndex: index });
    } else if (!/^[a-zA-Z\d/]*$/.test(headerValue)) {
      headerErrors.push({ typeOfError: "value", description: "Invalid characters in Header value", errorIndex: index });
    }
  });
  return headerErrors;
};
