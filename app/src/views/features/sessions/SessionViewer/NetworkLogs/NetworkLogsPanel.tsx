import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Empty, Typography } from "antd";
import { getIncludeNetworkLogs } from "store/features/session-recording/selectors";
import { trackSampleSessionClicked } from "modules/analytics/events/features/sessionRecording";
import { RQNetworkTable } from "lib/design-system/components/RQNetworkTable";
import { RQNetworkLog } from "lib/design-system/components/RQNetworkTable/types";
import { getOffset } from "./helpers";

interface Props {
  startTime: number;
  networkLogs: RQNetworkLog[];
  playerTimeOffset: number;
  updateCount: (count: number) => void;
}

const NetworkLogsPanel: React.FC<Props> = ({ startTime, networkLogs, playerTimeOffset, updateCount }) => {
  const visibleNetworkLogs = useMemo<RQNetworkLog[]>(() => {
    return networkLogs.filter((log: RQNetworkLog) => {
      return getOffset(log, startTime) <= playerTimeOffset;
    });
  }, [networkLogs, playerTimeOffset]);

  const includeNetworkLogs = useSelector(getIncludeNetworkLogs);

  useEffect(() => {
    updateCount(visibleNetworkLogs.length);
  }, [visibleNetworkLogs, updateCount]);

  return (
    <div className="session-panel-content network-logs-panel">
      {visibleNetworkLogs.length > 0 ? (
        <RQNetworkTable logs={visibleNetworkLogs} sessionRecordingStartTime={startTime} />
      ) : includeNetworkLogs === false ? (
        <div>
          <Typography.Text className="recording-options-message">
            This session does not contain any network requests. <br />
            Check out this{" "}
            <a
              href="/sessions/draft/mock/"
              target="_blank"
              rel="noreferrer"
              onClick={() => trackSampleSessionClicked("network")}
            >
              sample session
            </a>{" "}
            to see the type of information you can send with a session.
          </Typography.Text>
        </div>
      ) : (
        <div className={"placeholder"}>
          <Empty description={"Network logs appear here as video plays."} />
        </div>
      )}
    </div>
  );
};

export default React.memo(NetworkLogsPanel);
