import { NetworkEvent } from "./types";

export interface Vendor {
  name: string;
  icon: string;
  identify(url: string, method: string): boolean;
  getEventDetails(event: NetworkEvent): Record<string, any> | null;
}
