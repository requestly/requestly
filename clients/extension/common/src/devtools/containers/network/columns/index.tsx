import React from "react";
import { Column } from "@requestly-ui/resource-table";
import { RQNetworkEvent } from "../../../types";
import "./columns.scss";

export enum NETWORK_TABLE_COLUMN_IDS {
  URL = "url",
  METHOD = "method",
  STATUS = "status",
  TYPE = "type",
  SIZE = "size",
  TIME = "time",
}

const networkEventTableColumns: Column<RQNetworkEvent>[] = [
  {
    key: NETWORK_TABLE_COLUMN_IDS.URL,
    header: "URL",
    render: (networkEvent) => {
      const url = networkEvent.request.url;
      if (networkEvent?.metadata?.graphQLDetails) {
        const { operationName } = networkEvent.metadata.graphQLDetails;
        return (
          <div className="table-cell-url-wrapper">
            <span className="table-cell-url">{url}</span>
            <span className="table-cell-url-graphql-operation-name">{`(${operationName})`}</span>
          </div>
        );
      }
      return url;
    },
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
