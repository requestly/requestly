import React from "react";
import "./RQNetworkTable.css";
import { GenericNetworkTable } from "./GenericNetworkTable";
import { NetworkEntry } from "./GenericNetworkTable/types";

export interface RQNetworkLog {
  entry: NetworkEntry;
  id: number;
}

interface RQNetworkTableProps {
  logs: RQNetworkLog[];
}

export const RQNetworkTable: React.FC<RQNetworkTableProps> = ({ logs }) => {
  return (
    <div className="rq-network-table-container">
      <GenericNetworkTable
        logs={logs}
        networkEntrySelector={(log: RQNetworkLog) => log.entry}
        extraColumns={[]}
        extraDetailsTabs={[]}
      />
    </div>
  );
};
