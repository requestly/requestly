import { Vendor } from "../vendor";
import blueCoreIcon from "../../icons/bluecore-icon.svg";
import { NetworkEvent } from "../types";
import { getDecodedBase64Data } from "../utils";

enum BlueCoreEventType {}

export type BlueCoreEvent = Record<string, any>;

export class BlueCore implements Vendor {
  name: string = "BlueCore";
  icon: string = blueCoreIcon;

  urlPatterns: string[] = ["api.bluecore.app/api/track", "onsitestats.bluecore.com/events"];

  identify(url: string, method: string): boolean {
    return this.urlPatterns.some((pattern) => url.includes(pattern));
  }

  getGetMethodPayload(event: NetworkEvent): Record<string, any> | null {
    // TODO: Each url can have variations for payload, ie for some URL payload key can be different
    const url = event.request.url;
    const params = new URLSearchParams(url);
    const base64Data = params.get("stats_type");
    const eventDetails = getDecodedBase64Data(base64Data);

    // Match schema with post method payload
    return { event: eventDetails?.event_type, properties: eventDetails };
  }

  getPostMethodPayload(event: NetworkEvent): Record<string, any> | null {
    const postData = event.request.postData;

    if (!postData) {
      return null;
    }

    if (!postData.mimeType.includes("urlencoded")) {
      return null;
    }

    const params = new URLSearchParams(postData.text);
    const base64Data = params.get("data");

    const eventDetails = getDecodedBase64Data(base64Data);
    return eventDetails;
  }

  getEventPayloadByMethod(event: NetworkEvent) {
    switch (event.request.method) {
      case "GET": {
        return this.getGetMethodPayload(event);
      }

      case "POST": {
        return this.getPostMethodPayload(event);
      }

      default: {
        return null;
      }
    }
  }

  groupEventProperties(event: Record<string, any>): BlueCoreEvent {
    // 1. Group the events
    // 2. return
    return {};
  }

  getEventDetails(event: NetworkEvent): BlueCoreEvent | null {
    const payload = this.getEventPayloadByMethod(event);

    if (!payload) {
      return null;
    }

    return payload;

    return this.groupEventProperties(payload);
  }
}
