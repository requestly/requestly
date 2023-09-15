import React from "react";
import { GenericNetworkTable, GenericNetworkTableProps } from "./GenericNetworkTable";
import { RQSessionAttributes } from "@requestly/web-sdk";
import { secToMinutesAndSeconds } from "utils/DateTimeUtils";
import { getOffset } from "views/features/sessions/SessionViewer/NetworkLogs/helpers";
import { RQNetworkLog } from "./types";
import "./RQNetworkTable.css";

export interface RQNetworkTableProps {
  logs: RQNetworkLog[];
  contextMenuOptions?: GenericNetworkTableProps<RQNetworkLog>["contextMenuOptions"];
  sessionRecordingStartTime?: RQSessionAttributes["startTime"];
}

export const RQNetworkTable: React.FC<RQNetworkTableProps> = ({
  logs,
  contextMenuOptions = [],
  sessionRecordingStartTime = 0,
}) => {
  return (
    <div className="rq-network-table-container">
      <GenericNetworkTable
        logs={logs}
        networkEntrySelector={(log: RQNetworkLog) => log.entry}
        excludeColumns={["startedDateTime", "contentType"]}
        contextMenuOptions={contextMenuOptions}
        extraColumns={[
          {
            key: "timeOffset",
            header: "",
            width: 4,
            priority: 0.5,
            render: (log) => {
              const offset = getOffset(log, sessionRecordingStartTime);
              return secToMinutesAndSeconds(offset);
            },
          },
        ]}
      />
    </div>
  );
};
