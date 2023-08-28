import { Entry } from "har-format";

export type HarEntry = Entry;

export type NetworkEntry = HarEntry; // Add more in future. WSEntry || GRPCEntry

export interface RQNetworkLog {
  id: number;
  entry: NetworkEntry;
}
