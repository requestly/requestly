import React from "react";
import { GenericNetworkTable } from "./GenericNetworkTable";
import { RQNetworkLog } from "./types";
import "./RQNetworkTable.css";

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
