import { Empty } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { NetworkLog } from "../types";
import NetworkLogRow from "./NetworkLogRow";
import Split from "react-split";
import NetworkLogDetails from "./NetworkLogDetails";
import useAutoScrollableContainer from "hooks/useAutoScrollableContainer";
import { useSelector } from "react-redux";
import { getSessionRecordingMetadataOptions } from "store/features/session-recording/selectors";

interface Props {
  networkLogs: NetworkLog[];
  playerTimeOffset: number;
  updateCount: (count: number) => void;
}

const NetworkLogsPanel: React.FC<Props> = ({
  networkLogs,
  playerTimeOffset,
  updateCount,
}) => {
  const visibleNetworkLogs = useMemo<NetworkLog[]>(() => {
    return networkLogs.filter((networkLog: NetworkLog) => {
      return networkLog.timeOffset <= playerTimeOffset;
    });
  }, [networkLogs, playerTimeOffset]);

  const [containerRef, onScroll] = useAutoScrollableContainer<HTMLDivElement>(
    visibleNetworkLogs
  );

  const sessionMetadataOptions = useSelector(
    getSessionRecordingMetadataOptions
  );
  const [selectedLogIndex, setSelectedLogIndex] = useState(-1);

  useEffect(() => {
    updateCount(visibleNetworkLogs.length);
  }, [visibleNetworkLogs, updateCount]);

  const networkLogsTable = useMemo(
    () => (
      <div
        className="network-logs-table"
        ref={containerRef}
        onScroll={onScroll}
      >
        {visibleNetworkLogs.map((log, i) => (
          <NetworkLogRow
            key={i}
            {...log}
            onClick={() => setSelectedLogIndex(i)}
            isSelected={i === selectedLogIndex}
            showResponseTime={selectedLogIndex === -1}
          />
        ))}
      </div>
    ),
    [visibleNetworkLogs, selectedLogIndex, containerRef, onScroll]
  );

  return (
    <div className="session-panel-content network-logs-panel">
      {visibleNetworkLogs.length ? (
        selectedLogIndex === -1 ? (
          networkLogsTable
        ) : (
          <Split
            direction="horizontal"
            cursor="col-resize"
            sizes={[60, 40]}
            minSize={[400, 200]}
            gutterSize={4}
            gutterAlign="center"
            style={{ display: "flex", height: "100%" }}
            snapOffset={30}
          >
            {networkLogsTable}
            <NetworkLogDetails
              {...visibleNetworkLogs[selectedLogIndex]}
              onClose={() => setSelectedLogIndex(-1)}
            />
          </Split>
        )
      ) : (
        <div className="placeholder">
          <Empty
            description={
              sessionMetadataOptions.networkLogs === false
                ? "Network logs have not been shared. You can choose to share them while saving."
                : "Network logs appear here as video plays."
            }
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(NetworkLogsPanel);
