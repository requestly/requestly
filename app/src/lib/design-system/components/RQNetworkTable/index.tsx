import React from "react";
import { GenericNetworkTable } from "./GenericNetworkTable";
import { NetworkEntry } from "./GenericNetworkTable/types";
import { RQSessionAttributes } from "@requestly/web-sdk";
import { secToMinutesAndSeconds } from "utils/DateTimeUtils";
import "./RQNetworkTable.css";

export interface RQNetworkLog {
  id: string;
  entry: NetworkEntry;
}

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
        excludeColumns={["time", "contentType"]}
        extraColumns={[
          {
            key: "timeOffset",
            header: "Time",
            width: 4,
            priority: 0.5,
            render: (log) => {
              const offset = Math.floor(
                (new Date(Number(log.entry.startedDateTime)).getTime() - sessionRecordingStartTime) / 1000
              );

              return secToMinutesAndSeconds(offset);
            },
          },
        ]}
      />
    </div>
  );
};
