import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Empty, Typography } from "antd";
import { getIncludeNetworkLogs } from "store/features/session-recording/selectors";
import {
  trackSampleSessionClicked,
  trackSessionRecordingNetworkLogContextMenuOpen,
  trackSessionRecordingNetworkLogContextMenuOptionClicked,
} from "modules/analytics/events/features/sessionRecording";
import { RQNetworkTable, RQNetworkTableProps } from "lib/design-system/components/RQNetworkTable";
import { RQNetworkLog } from "lib/design-system/components/RQNetworkTable/types";
import { APIClient, APIClientRequest } from "components/common/APIClient";
import { getOffset } from "./helpers";
import { copyToClipBoard } from "utils/Misc";

interface Props {
  startTime: number;
  networkLogs: RQNetworkLog[];
  playerTimeOffset: number;
  updateCount: (count: number) => void;
}

const NetworkLogsPanel: React.FC<Props> = ({ startTime, networkLogs, playerTimeOffset, updateCount }) => {
  const [isApiClientModalOpen, setIsApiClientModalOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState<APIClientRequest>(null);

  const visibleNetworkLogs = useMemo<RQNetworkLog[]>(() => {
    return networkLogs.filter((log: RQNetworkLog) => {
      return getOffset(log, startTime) <= playerTimeOffset;
    });
  }, [networkLogs, startTime, playerTimeOffset]);

  const includeNetworkLogs = useSelector(getIncludeNetworkLogs);

  useEffect(() => {
    updateCount(visibleNetworkLogs.length);
  }, [visibleNetworkLogs, updateCount]);

  const options = useMemo(
    () =>
      [
        {
          key: "copy_url",
          label: "Copy URL",
          onSelect: (key, log) => {
            copyToClipBoard(log.entry.request.url, "URL copied to clipboard");
            trackSessionRecordingNetworkLogContextMenuOptionClicked(key);
          },
        },
        {
          type: "divider",
        },
        {
          key: "replay_request",
          label: "Replay Request",
          onSelect: (key, log) => {
            const { url, method, headers, postData } = log.entry.request ?? {};

            setSelectedRequestData({
              url,
              method,
              body: postData.text,
              headers: headers.reduce((result, header) => ({ ...result, [header.name]: header.value }), {}),
            });

            trackSessionRecordingNetworkLogContextMenuOptionClicked(key);
            setIsApiClientModalOpen(true);
          },
        },
      ] as RQNetworkTableProps["contextMenuOptions"],
    []
  );

  const handleCloseApiClientModal = useCallback(() => {
    setIsApiClientModalOpen(false);
    setSelectedRequestData(null);
  }, []);

  return (
    <div className="session-panel-content network-logs-panel">
      {visibleNetworkLogs.length > 0 ? (
        <>
          <RQNetworkTable
            logs={visibleNetworkLogs}
            contextMenuOptions={options}
            sessionRecordingStartTime={startTime}
            onContextMenuOpenChange={(isOpen) => {
              if (isOpen) trackSessionRecordingNetworkLogContextMenuOpen();
            }}
          />

          <APIClient
            openInModal
            modalTitle="Replay request"
            request={selectedRequestData}
            isModalOpen={isApiClientModalOpen}
            onModalClose={handleCloseApiClientModal}
          />
        </>
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
