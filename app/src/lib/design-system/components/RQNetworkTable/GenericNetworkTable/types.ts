import { Entry } from "har-format";

export type HarEntry = Entry;

export type NetworkEntry = Partial<HarEntry>; // Add more in future. WSEntry || GRPCEntry
