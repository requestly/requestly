import React, { useMemo } from "react";
import { ColorScheme, ResourceTable } from "@requestly-ui/resource-table";
import { rqNetworkLogColumns } from "./rqNetworkLogColumns";
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
  /**
   * [] Generic column renderer [done]
   * [] Generic details renderer
   */

  const logType = logs?.[0]?.logType;

  const columns = useMemo(() => {
    if (logType === RQNetworkLogType.SESSION_RECORDING) {
      const columnsToExclude = ["rulesApplied"];
      return rqNetworkLogColumns.filter((column) => !columnsToExclude.includes(column.key));
    }
    return rqNetworkLogColumns;
  }, [logType]);

  return (
    <div className="rq-network-table-container">
      <ResourceTable colorScheme={ColorScheme.DARK} resources={logs} columns={columns} />
    </div>
  );
};
