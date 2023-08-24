import React, { useMemo, useState } from "react";
import { ColorScheme, ResourceTable } from "@requestly-ui/resource-table";
import { rqNetworkLogColumns } from "./columns";
import { detailsTabs } from "./detailsTabs";
import {
  RQNetworkLog,
  RQNetworkLogType,
} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
import "./RQNetworkTable.css";

interface RQNetworkTableProps {
  logs: RQNetworkLog[];
}

export const RQNetworkTable: React.FC<RQNetworkTableProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<RQNetworkLog | null>(null);
  const logType = logs?.[0]?.logType;

  const filteredColumns = useMemo(() => {
    if (logType === RQNetworkLogType.SESSION_RECORDING) {
      const columnsToExclude = ["rulesApplied"];
      return rqNetworkLogColumns.filter((column) => !columnsToExclude.includes(column.key));
    }
    return rqNetworkLogColumns;
  }, [logType]);

  const filteredDetailsTabs = useMemo(() => {
    if (
      selectedLog &&
      selectedLog.request.queryParams?.length === 0 &&
      (selectedLog.request.method?.toLocaleLowerCase() ?? "get") === "get"
    ) {
      return detailsTabs.filter((tab) => tab.key !== "payload");
    }

    return detailsTabs;
  }, [selectedLog]);

  return (
    <div className="rq-network-table-container">
      <ResourceTable
        resources={logs}
        columns={filteredColumns}
        detailsTabs={filteredDetailsTabs}
        primaryColumnKeys={["url"]}
        colorScheme={ColorScheme.DARK}
        onRowSelection={setSelectedLog}
      />
    </div>
  );
};
