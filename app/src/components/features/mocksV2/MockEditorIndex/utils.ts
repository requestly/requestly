import HEADER_SUGGESTIONS from "config/constants/sub/header-suggestions";
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

export const validateHeaders = (headers: { [key: string]: string }) => {
  const headerArray = Object.values(headers).map((item) => {
    if (item && typeof item === "object") {
      //@ts-ignore
      return { name: item.name || "", value: item.value || "" };
    } else {
      return { name: "", value: "" };
    }
  });

  const HeaderErrors = [];
  const seenHeaderNames = new Set();

  for (let i = 0; i < headerArray.length; i++) {
    const header = headerArray[i];
    const error: { typeOfError?: string; errorIndex?: number } = {};

    if (!header.name) {
      error.typeOfError = "name Header name is required";
      error.errorIndex = i;
      HeaderErrors.push(error);
    } else {
      const isValidHeaderName = HEADER_SUGGESTIONS.Response.some(
        (option) => option.value.toLowerCase() === header.name.toLowerCase()
      );

      if (!isValidHeaderName) {
        error.typeOfError = "name Invalid Header name";
        error.errorIndex = i;
        HeaderErrors.push(error);
      }
      if (seenHeaderNames.has(header.name.toLowerCase())) {
        error.typeOfError = "name Duplicate Header name";
        error.errorIndex = i;
        HeaderErrors.push(error);
      } else {
        seenHeaderNames.add(header.name.toLowerCase());
      }
    }

    if (!header.value) {
      const valueError: { typeOfError?: string; errorIndex?: number } = {
        typeOfError: "value Header value is required",
        errorIndex: i,
      };
      HeaderErrors.push(valueError);
    }

    if (
      !/^[a-zA-Z]+$/.test(header.value) &&
      !/^\d+$/.test(header.value) &&
      header.value !== "" &&
      !/[/]/.test(header.value)
    ) {
      const TypeError: { typeOfError?: string; errorIndex?: number } = {
        typeOfError: "value Invalid characters in Header value",
        errorIndex: i,
      };
      HeaderErrors.push(TypeError);
    }
  }

  return { HeaderErrors };
};
