export type NetworkEvent = chrome.devtools.network.Request;

export enum VendorName {
  BLUECORE = "BlueCore",
}

export interface VendorEvent {
  event: string;
  properties: Record<string, any>;
  rawEvent: Record<string, any>;
}
