import React from "react";
import { GenericNetworkTable } from "./GenericNetworkTable";
import { RQSessionAttributes } from "@requestly/web-sdk";
import { secToMinutesAndSeconds } from "utils/DateTimeUtils";
import { RQNetworkLog } from "./types";
import "./RQNetworkTable.css";

interface RQNetworkTableProps {
  logs: RQNetworkLog[];
  sessionRecordingStartTime?: RQSessionAttributes["startTime"];
}

export const RQNetworkTable: React.FC<RQNetworkTableProps> = ({ logs, sessionRecordingStartTime = 0 }) => {
  return (
    <div className="rq-network-table-container">
      <GenericNetworkTable
        logs={logs}
        networkEntrySelector={(log: RQNetworkLog) => log.entry}
        excludeColumns={["startedDateTime", "contentType"]}
        extraColumns={[
          {
            key: "timeOffset",
            header: "",
            width: 4,
            priority: 0.5,
            render: (log) => {
              let offset = Math.floor(
                (new Date(Number(log.entry.startedDateTime)).getTime() - sessionRecordingStartTime) / 1000
              );

              offset = offset >= 0 ? offset : 0; // Sometimes offset comes out negative.
              return secToMinutesAndSeconds(offset);
            },
          },
        ]}
      />
    </div>
  );
};
