import { Entry } from "har-format";
import { Column as ResourceTableColumn } from "@requestly-ui/resource-table";

export type HarEntry = Entry;

export type NetworkEntry = Partial<HarEntry>; // Add more in future. WSEntry || GRPCEntry

export type Column<NetworkLog> = ResourceTableColumn<NetworkLog> & { priority: number };
