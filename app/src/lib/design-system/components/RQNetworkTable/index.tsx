import React, { useMemo, useState } from "react";
import { ColorScheme, ResourceTable } from "@requestly-ui/resource-table";
import { rqNetworkLogColumns } from "./columns";
import { detailsTabs } from "./detailsTabs";
import {
  RQNetworkLog,
  RQNetworkLogType,
} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
import "./RQNetworkTable.css";

// colorScheme?: ColorScheme;
// resources: ResourceType[];
// columns: Column<ResourceType>[];
// primaryColumnKeys?: string[];
// detailsTabs?: DetailsTab<ResourceType>[];
// filter?: (resource: ResourceType) => boolean;
// isFailed?: (resource: ResourceType) => boolean;
// onRowSelection?: (resource: ResourceType) => void;
// onDetailsTabChange?: (tabKey: string) => void;

/**
 * Need top level info of which colums to show
 * if some logs have specific properties and some dont then we
 * cannot distinguish between if we want to show that info in a column or not
 *
 * Solution:
 *  1. Let the parent component decide which columns to show
 *  2. Each log should have a log type which will be used to decide which columns to show
 */

interface RQNetworkTableProps {
  logs: RQNetworkLog[];
}

export const RQNetworkTable: React.FC<RQNetworkTableProps> = ({ logs }) => {
  // @ts-ignore
  const [selectedLog, setSelectedLog] = useState<RQNetworkLog | null>(null);
  const logType = logs?.[0]?.logType;

  const filteredColumns = useMemo(() => {
    if (logType === RQNetworkLogType.SESSION_RECORDING) {
      const columnsToExclude = ["rulesApplied"];
      return rqNetworkLogColumns.filter((column) => !columnsToExclude.includes(column.key));
    }
    return rqNetworkLogColumns;
  }, [logType]);

  // const filteredDetailsTabs = useMemo(() => {
  //   if (
  //     selectedLog &&
  //     selectedLog.request.queryParams?.length === 0 &&
  //     (selectedLog.request.method?.toLocaleLowerCase() ?? "get") === "get"
  //   ) {
  //     return detailsTabs.filter((tab) => tab.key !== "payload");
  //   }

  //   return detailsTabs;
  // }, [selectedLog]);

  return (
    <div className="rq-network-table-container">
      <ResourceTable
        resources={logs}
        columns={filteredColumns}
        detailsTabs={detailsTabs}
        primaryColumnKeys={["url"]}
        colorScheme={ColorScheme.DARK}
        onRowSelection={setSelectedLog}
      />
    </div>
  );
};
