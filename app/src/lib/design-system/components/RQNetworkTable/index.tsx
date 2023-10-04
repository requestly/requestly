import React, { useRef, useMemo, useEffect } from "react";
import { GenericNetworkTable, GenericNetworkTableProps } from "./GenericNetworkTable";
import { RQSessionAttributes } from "@requestly/web-sdk";
import { secToMinutesAndSeconds } from "utils/DateTimeUtils";
import { getOffset } from "views/features/sessions/SessionViewer/NetworkLogs/helpers";
import { RQNetworkLog } from "./types";
import { AiFillCaretRight } from "@react-icons/all-files/ai/AiFillCaretRight";
import "./RQNetworkTable.css";

export interface RQNetworkTableProps {
  logs: RQNetworkLog[];
  contextMenuOptions?: GenericNetworkTableProps<RQNetworkLog>["contextMenuOptions"];
  onContextMenuOpenChange?: GenericNetworkTableProps<RQNetworkLog>["onContextMenuOpenChange"];
  sessionRecordingStartTime?: RQSessionAttributes["startTime"];
  emptyView?: GenericNetworkTableProps<RQNetworkLog>["emptyView"];
  sessionCurrentOffset?: number;
  isRowPending?: (log: RQNetworkLog) => boolean;
}

export const RQNetworkTable: React.FC<RQNetworkTableProps> = ({
  logs,
  contextMenuOptions = [],
  sessionRecordingStartTime = 0,
  onContextMenuOpenChange = (isOpen) => {},
  emptyView,
  sessionCurrentOffset,
  isRowPending,
}) => {
  const activeLogId = useRef(null);
  const extraColumns: GenericNetworkTableProps<RQNetworkLog>["extraColumns"] = useMemo(
    () => [
      {
        key: "timeOffset",
        header: "",
        width: 4,
        priority: 0.5,
        render: (log) => {
          const offset = Math.floor(getOffset(log, sessionRecordingStartTime));
          return (
            <div className="offset-cell">
              <span className="row-pointer">
                {activeLogId.current === log.id && <AiFillCaretRight color="var(--white)" />}
              </span>
              <span>{secToMinutesAndSeconds(offset)}</span>
            </div>
          );
        },
      },
    ],
    [sessionRecordingStartTime]
  );

  useEffect(() => {
    const recentLog = logs.reduce(
      (closest, log: RQNetworkLog) => {
        const timeDifference = Math.abs(sessionCurrentOffset - getOffset(log, sessionRecordingStartTime));
        if (timeDifference < closest.minTimeDifference && timeDifference >= 0) {
          return { log: log, minTimeDifference: timeDifference };
        }

        return closest;
      },
      { log: null, minTimeDifference: Infinity }
    );
    if (!isRowPending(recentLog.log)) activeLogId.current = recentLog.log.id;
  }, [logs, sessionCurrentOffset, isRowPending]);

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
