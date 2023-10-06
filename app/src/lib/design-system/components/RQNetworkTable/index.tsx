import React, { useMemo, useEffect, useState } from "react";
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
  rowClassName?: (log: RQNetworkLog) => string | string;
  disableAutoScroll?: boolean;
}

export const RQNetworkTable: React.FC<RQNetworkTableProps> = ({
  logs,
  contextMenuOptions = [],
  sessionRecordingStartTime = 0,
  onContextMenuOpenChange = (isOpen) => {},
  emptyView,
  sessionCurrentOffset,
  rowClassName,
  disableAutoScroll = false,
}) => {
  const [activeLogId, setActiveLogId] = useState(null);
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
              <span className="row-pointer">{activeLogId === log.id && <AiFillCaretRight color="var(--white)" />}</span>
              <span>{secToMinutesAndSeconds(offset)}</span>
            </div>
          );
        },
      },
    ],
    [sessionRecordingStartTime, activeLogId]
  );

  useEffect(() => {
    const closestLog = logs.reduce(
      (closest, log: RQNetworkLog) => {
        const logOffset = getOffset(log, sessionRecordingStartTime);

        if (logOffset <= sessionCurrentOffset) {
          const currentLogDifference = Math.abs(sessionCurrentOffset - logOffset);
          if (currentLogDifference < closest.minTimeDifference) {
            return { log: log, minTimeDifference: currentLogDifference };
          }
        }

        return closest;
      },
      { log: null, minTimeDifference: Infinity }
    );

    setActiveLogId(closestLog?.log?.id);
  }, [logs, sessionCurrentOffset, sessionRecordingStartTime]);

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
        rowClassName={rowClassName}
        disableAutoScroll={disableAutoScroll}
      />
    </div>
  );
};
