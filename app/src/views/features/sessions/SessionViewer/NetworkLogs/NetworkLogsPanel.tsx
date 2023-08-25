import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Empty, Typography } from "antd";
import { NetworkLog } from "../types";
import useAutoScrollableContainer from "hooks/useAutoScrollableContainer";
import { getIncludeNetworkLogs } from "store/features/session-recording/selectors";
import { trackSampleSessionClicked } from "modules/analytics/events/features/sessionRecording";
import { RQNetworkTable } from "lib/design-system/components/RQNetworkTable";
import { convertSessionRecordingNetworkLogsToRQNetworkLogs } from "./helpers";

interface Props {
  networkLogs: NetworkLog[];
  playerTimeOffset: number;
  updateCount: (count: number) => void;
}

const NetworkLogsPanel: React.FC<Props> = ({ networkLogs, playerTimeOffset, updateCount }) => {
  const visibleNetworkLogs = useMemo<NetworkLog[]>(() => {
    return networkLogs.filter((networkLog: NetworkLog) => {
      return networkLog.timeOffset <= playerTimeOffset;
    });
  }, [networkLogs, playerTimeOffset]);

  const convertedLogs = useMemo(() => convertSessionRecordingNetworkLogsToRQNetworkLogs(visibleNetworkLogs), [
    visibleNetworkLogs,
  ]);

  const [containerRef, onScroll] = useAutoScrollableContainer<HTMLDivElement>(visibleNetworkLogs);

  const includeNetworkLogs = useSelector(getIncludeNetworkLogs);

  useEffect(() => {
    updateCount(visibleNetworkLogs.length);
  }, [visibleNetworkLogs, updateCount]);

  const networkLogsTable = useMemo(
    () => (
      <div className="network-logs-table" ref={containerRef} onScroll={onScroll}>
        {<RQNetworkTable logs={convertedLogs} />}
      </div>
    ),
    [containerRef, onScroll]
  );

  // const networkLogsTable = useMemo(
  //   () => (
  //     <div className="network-logs-table" ref={containerRef} onScroll={onScroll}>
  //       {visibleNetworkLogs.map((log, i) => (
  //         <NetworkLogRow
  //           key={i}
  //           {...log}
  //           onClick={() => setSelectedLogIndex(i)}
  //           isSelected={i === selectedLogIndex}
  //           showResponseTime={selectedLogIndex === -1}
  //         />
  //       ))}
  //     </div>
  //   ),
  //   [visibleNetworkLogs, selectedLogIndex, containerRef, onScroll]
  // );

  return (
    <div className="session-panel-content network-logs-panel">
      {visibleNetworkLogs.length > 0 ? (
        networkLogsTable
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
