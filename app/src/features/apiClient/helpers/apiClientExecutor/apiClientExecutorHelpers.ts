import { RequestMethod } from "features/apiClient/types";
import { isValidUrl } from "utils/FormattingHelper";

export const isOnline = () => {
  return window.navigator.onLine === true;
};

export const isMethodSupported = (method: string) => {
  return Object.keys(RequestMethod).includes(method);
};

export const isUrlValid = (url: string) => {
  return isValidUrl(url);
};

export const isUrlProtocolValid = (url: string) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};
