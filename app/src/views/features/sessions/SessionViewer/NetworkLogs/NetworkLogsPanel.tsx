import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Empty, Typography } from "antd";
import { getIncludeNetworkLogs } from "store/features/session-recording/selectors";
import { actions } from "store";
import { getActiveModals } from "store/selectors";
import { RQNetworkLog } from "lib/design-system/components/RQNetworkTable/types";
import { RQNetworkTable, RQNetworkTableProps } from "lib/design-system/components/RQNetworkTable";
import { APIClient, APIClientRequest } from "components/common/APIClient";
import RuleEditorModal from "components/common/RuleEditorModal";
import { getOffset } from "./helpers";
import { snakeCase } from "lodash";
import { RuleType } from "types";
import {
  trackSampleSessionClicked,
  trackSessionRecordingNetworkLogContextMenuOpen,
  trackSessionRecordingNetworkLogContextMenuOptionClicked,
} from "modules/analytics/events/features/sessionRecording";
// import { trackRuleCreationWorkflowStartedEvent } from "modules/analytics/events/common/rules";

interface Props {
  startTime: number;
  networkLogs: RQNetworkLog[];
  playerTimeOffset: number;
  updateCount: (count: number) => void;
}

const NetworkLogsPanel: React.FC<Props> = ({ startTime, networkLogs, playerTimeOffset, updateCount }) => {
  const dispatch = useDispatch();
  const { ruleEditorModal } = useSelector(getActiveModals);
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

  const handleContextMenuRuleOptionClick = useCallback(
    (key: React.Key, log: RQNetworkLog) => {
      const ruleData = {
        id: log.id,
        url: log.entry.request.url,
        request: {
          body: log.entry.request.postData.text,
        },
        response: {
          body: log.entry.response.content.text,
        },
      };

      dispatch(
        actions.toggleActiveModal({
          newValue: true,
          modalName: "ruleEditorModal",
          newProps: { ruleData, ruleType: key },
        })
      );

      // TBD
      // trackRuleCreationWorkflowStartedEvent(key, "modal");
      trackSessionRecordingNetworkLogContextMenuOptionClicked(snakeCase(key as string));
    },
    [dispatch]
  );

  const handleCloseRuleEditorModal = useCallback(() => {
    dispatch(
      actions.toggleActiveModal({
        newValue: false,
        modalName: "ruleEditorModal",
      })
    );
  }, [dispatch]);

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
        {
          type: "divider",
        },
        {
          key: RuleType.REDIRECT,
          label: "Redirect URL(Map local/Remote)",
          onSelect: handleContextMenuRuleOptionClick,
        },
        {
          key: RuleType.RESPONSE,
          label: "Modify Response Body",
          onSelect: handleContextMenuRuleOptionClick,
        },
        {
          key: RuleType.REQUEST,
          label: "Modify Request Body",
          onSelect: handleContextMenuRuleOptionClick,
        },
        {
          key: RuleType.HEADERS,
          label: "Modify Headers",
          onSelect: handleContextMenuRuleOptionClick,
        },
        {
          key: RuleType.REPLACE,
          label: "Replace part of URL",
          onSelect: handleContextMenuRuleOptionClick,
        },

        {
          key: RuleType.CANCEL,
          label: "Cancel Request",
          onSelect: handleContextMenuRuleOptionClick,
        },
        {
          key: RuleType.SCRIPT,
          label: "Insert Custom Script",
          onSelect: handleContextMenuRuleOptionClick,
        },
        {
          key: RuleType.DELAY,
          label: "Delay Request",
          onSelect: handleContextMenuRuleOptionClick,
        },
        {
          key: RuleType.QUERYPARAM,
          label: "Modify Query Params",
          onSelect: handleContextMenuRuleOptionClick,
        },
        {
          key: RuleType.USERAGENT,
          label: "Modify User Agent",
          onSelect: handleContextMenuRuleOptionClick,
        },
      ] as RQNetworkTableProps["contextMenuOptions"],
    [handleContextMenuRuleOptionClick]
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

          {isApiClientModalOpen && (
            <APIClient
              openInModal
              modalTitle="Replay request"
              request={selectedRequestData}
              isModalOpen={isApiClientModalOpen}
              onModalClose={handleCloseApiClientModal}
            />
          )}

          {ruleEditorModal.isActive && (
            <RuleEditorModal
              isOpen={ruleEditorModal.isActive}
              handleModalClose={handleCloseRuleEditorModal}
              analyticEventEditorViewedSource="session_recording_network_panel"
            />
          )}
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
