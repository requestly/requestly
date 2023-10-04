import React, { useMemo } from "react";
import { GenericNetworkTable, GenericNetworkTableProps } from "./GenericNetworkTable";
import { RQSessionAttributes } from "@requestly/web-sdk";
import { secToMinutesAndSeconds } from "utils/DateTimeUtils";
import { getOffset } from "views/features/sessions/SessionViewer/NetworkLogs/helpers";
import { RQNetworkLog } from "./types";
import "./RQNetworkTable.css";

export interface RQNetworkTableProps {
  logs: RQNetworkLog[];
  contextMenuOptions?: GenericNetworkTableProps<RQNetworkLog>["contextMenuOptions"];
  onContextMenuOpenChange?: GenericNetworkTableProps<RQNetworkLog>["onContextMenuOpenChange"];
  sessionRecordingStartTime?: RQSessionAttributes["startTime"];
  emptyView?: GenericNetworkTableProps<RQNetworkLog>["emptyView"];
  isRowPending?: (log: RQNetworkLog) => boolean;
}

export const RQNetworkTable: React.FC<RQNetworkTableProps> = ({
  logs,
  contextMenuOptions = [],
  sessionRecordingStartTime = 0,
  onContextMenuOpenChange = (isOpen) => {},
  emptyView,
  isRowPending,
}) => {
  const extraColumns: GenericNetworkTableProps<RQNetworkLog>["extraColumns"] = useMemo(
    () => [
      {
        key: "timeOffset",
        header: "",
        width: 4,
        priority: 0.5,
        render: (log) => {
          const offset = Math.floor(getOffset(log, sessionRecordingStartTime));
          return secToMinutesAndSeconds(offset);
        },
      },
    ],
    [sessionRecordingStartTime]
  );

  return (
    <div className="rq-network-table-container">
      <GenericNetworkTable
        logs={logs}
        extraColumns={extraColumns}
        excludeColumns={["startedDateTime", "contentType"]}
        networkEntrySelector={(log: RQNetworkLog) => log.entry}
        contextMenuOptions={contextMenuOptions}
        onContextMenuOpenChange={onContextMenuOpenChange}
        emptyView={emptyView}
        isRowPending={isRowPending}
      />
    </div>
  );
};
