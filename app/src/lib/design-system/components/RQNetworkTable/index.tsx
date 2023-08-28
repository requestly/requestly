import React from "react";
import { GenericNetworkTable } from "./GenericNetworkTable";
import { NetworkEntry } from "./GenericNetworkTable/types";
import "./RQNetworkTable.css";

export interface RQNetworkLog {
  id: number;
  entry: NetworkEntry;
}

interface RQNetworkTableProps {
  logs: RQNetworkLog[];
}

export const RQNetworkTable: React.FC<RQNetworkTableProps> = ({ logs }) => {
  return (
    <div className="rq-network-table-container">
      <GenericNetworkTable logs={logs} networkEntrySelector={(log: RQNetworkLog) => log.entry} />
    </div>
  );
};
