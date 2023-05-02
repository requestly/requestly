import { ExecutionEvent, NetworkResourceType } from "../../types";

export const getResourceType = (requestType: ExecutionEvent["requestType"]): NetworkResourceType => {
  switch (requestType) {
    case "main_frame":
    case "sub_frame":
      return NetworkResourceType.DOC;
    case "stylesheet":
      return NetworkResourceType.CSS;
    case "script":
      return NetworkResourceType.JS;
    case "image":
      return NetworkResourceType.IMG;
    case "font":
      return NetworkResourceType.FONT;
    case "media":
      return NetworkResourceType.MEDIA;
    case "websocket":
      return NetworkResourceType.WEBSOCKET;
    case "xmlhttprequest":
      return NetworkResourceType.XHR;
    case "fetch":
      return NetworkResourceType.FETCH;
    default:
      return NetworkResourceType.OTHER;
  }
};
