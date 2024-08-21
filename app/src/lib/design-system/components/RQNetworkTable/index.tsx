import React, { useMemo, useEffect, useState, useRef } from "react";
import { GenericNetworkTable, GenericNetworkTableProps } from "./GenericNetworkTable";
import { RQSessionAttributes } from "@requestly/web-sdk";
import { secToMinutesAndSeconds } from "utils/DateTimeUtils";
import { getOffset } from "views/features/sessions/SessionViewer/NetworkLogs/helpers";
import { RQNetworkLog } from "./types";
import { AiFillCaretRight } from "@react-icons/all-files/ai/AiFillCaretRight";
import useFocusedAutoScroll from "./useFocusedAutoScroll";
import "./RQNetworkTable.css";
import { getFile } from "services/firebaseStorageService";

export interface RQNetworkTableProps {
  logs: RQNetworkLog[];
  contextMenuOptions?: GenericNetworkTableProps<RQNetworkLog>["contextMenuOptions"];
  onContextMenuOpenChange?: GenericNetworkTableProps<RQNetworkLog>["onContextMenuOpenChange"];
  sessionRecordingStartTime?: RQSessionAttributes["startTime"];
  emptyView?: GenericNetworkTableProps<RQNetworkLog>["emptyView"];
  sessionCurrentOffset?: number;
  autoScroll?: boolean;
  disableFilters?: boolean;
}

export const RQNetworkTable: React.FC<RQNetworkTableProps> = ({
  logs,
  contextMenuOptions = [],
  sessionRecordingStartTime = 0,
  onContextMenuOpenChange = (isOpen) => {},
  emptyView,
  sessionCurrentOffset,
  autoScroll = false,
  disableFilters = false,
}) => {
  const [activeLogId, setActiveLogId] = useState(null);
  const [selectedLog, setSelectedLog] = useState<RQNetworkLog | null>(null);
  const containerRef = useRef(null);
  const onScroll = useFocusedAutoScroll(containerRef, activeLogId);

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

  const isLogPending = (log: RQNetworkLog) => {
    return getOffset(log, sessionRecordingStartTime) > sessionCurrentOffset;
  };

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

  const finalLogs = useMemo(() => {
    let finalLogs = logs;
    if (selectedLog) {
      const logIndex = logs.findIndex((log) => log.id === selectedLog.id);
      if (logIndex !== -1) {
        if (finalLogs[logIndex].entry._RQ) {
          if ((finalLogs[logIndex].entry._RQ as any)?.responseBodyPath) {
            getFile((finalLogs[logIndex].entry._RQ as any).responseBodyPath)
              .then((response) => {
                finalLogs[logIndex].entry.response.content.text = response;
              })
              .catch((error) => {
                console.error("Error fetching response body:", error);
              });
          }

          if ((finalLogs[logIndex].entry._RQ as any)?.requestBodyPath) {
            getFile((finalLogs[logIndex].entry._RQ as any).requestBodyPath)
              .then((request) => {
                finalLogs[logIndex].entry.request.postData.text = request;
              })
              .catch((error) => {
                console.error("Error fetching request body:", error);
              });
          }
        }
      }
    }
    return finalLogs;
  }, [logs, selectedLog]);
  return (
    <div className="rq-network-table-container">
      <GenericNetworkTable
        logs={finalLogs}
        extraColumns={extraColumns}
        excludeColumns={["startedDateTime", "contentType"]}
        networkEntrySelector={(log: RQNetworkLog) => log.entry}
        contextMenuOptions={contextMenuOptions}
        onContextMenuOpenChange={onContextMenuOpenChange}
        emptyView={emptyView}
        rowStyle={(log: RQNetworkLog) => (isLogPending(log) ? { opacity: 0.45 } : {})}
        autoScroll={autoScroll}
        tableRef={containerRef}
        onTableScroll={onScroll}
        disableFilters={disableFilters}
        onRowClick={setSelectedLog}
      />
    </div>
  );
};
