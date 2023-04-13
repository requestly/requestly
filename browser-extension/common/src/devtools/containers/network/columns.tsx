import { Column } from "../../components/ResourceTable";
import { NetworkEvent } from "../../types";

export enum NETWORK_TABLE_COLUMN_IDS {
  URL = "url",
  METHOD = "method",
  STATUS = "status",
  TYPE = "type",
  SIZE = "size",
  TIME = "time",
}

const networkEventTableColumns: Column<NetworkEvent>[] = [
  {
    key: NETWORK_TABLE_COLUMN_IDS.URL,
    header: "URL",
    render: (networkEvent) => networkEvent.request.url,
  },
  {
    key: NETWORK_TABLE_COLUMN_IDS.METHOD,
    header: "Method",
    width: 6,
    render: (networkEvent) => networkEvent.request.method,
  },
  {
    key: NETWORK_TABLE_COLUMN_IDS.STATUS,
    header: "Status",
    width: 6,
    render: (networkEvent) => networkEvent.response.status || "(canceled)",
  },
  {
    key: NETWORK_TABLE_COLUMN_IDS.TYPE,
    header: "Type",
    width: 10,
    render: (networkEvent) => networkEvent._resourceType,
  },
  {
    key: NETWORK_TABLE_COLUMN_IDS.SIZE,
    header: "Size",
    width: 8,
    render: (networkEvent) => {
      const bytes = networkEvent.response.content.size;

      if (bytes < 1000) {
        return `${bytes} B`;
      }

      if (bytes < 1000000) {
        return `${Math.round(bytes / 1000)} Kb`;
      }

      return `${(bytes / 1000000).toFixed(1)} Mb`;
    },
  },
  {
    key: NETWORK_TABLE_COLUMN_IDS.TIME,
    header: "Time",
    width: 8,
    render: (networkEvent) => {
      const ms = Math.ceil(networkEvent.time);

      if (ms < 1000) {
        return `${ms} ms`;
      }

      return `${(ms / 1000).toFixed(3)} s`;
    },
  },
];

export default networkEventTableColumns;
