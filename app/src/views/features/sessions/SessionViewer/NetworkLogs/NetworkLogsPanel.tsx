import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Empty, Typography, Row } from "antd";
import { getIncludeNetworkLogs } from "store/features/session-recording/selectors";
import { globalActions } from "store/slices/global/slice";
import { getActiveModals } from "store/slices/global/modals/selectors";
import { RQNetworkLog } from "lib/design-system/components/RQNetworkTable/types";
import { RQNetworkTable, RQNetworkTableProps } from "lib/design-system/components/RQNetworkTable";
import { APIClientModal, APIClientRequest } from "features/apiClient/components/common/APIClient";
import RuleEditorModal from "components/common/RuleEditorModal";
import { copyToClipBoard } from "utils/Misc";
import { snakeCase } from "lodash";
import { trackRuleCreationWorkflowStartedEvent } from "modules/analytics/events/common/rules";
import {
  trackSampleSessionClicked,
  trackSessionRecordingNetworkLogContextMenuOpen,
  trackSessionRecordingNetworkLogContextMenuOptionClicked,
} from "modules/analytics/events/features/sessionRecording";
import { RuleType } from "@requestly/shared/types/entities/rules";
import { useCheckLocalSyncSupport } from "features/apiClient/helpers/modules/sync/useCheckLocalSyncSupport";

interface Props {
  startTime: number;
  networkLogs: RQNetworkLog[];
  playerTimeOffset: number;
  disableFilters?: boolean;
}

const NetworkLogsPanel: React.FC<Props> = ({ startTime, networkLogs, playerTimeOffset, disableFilters = false }) => {
  const dispatch = useDispatch();
  const { ruleEditorModal } = useSelector(getActiveModals);
  const [isApiClientModalOpen, setIsApiClientModalOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState<APIClientRequest>(null);
  const isLocalSyncEnabled = useCheckLocalSyncSupport();

  const includeNetworkLogs = useSelector(getIncludeNetworkLogs);

  const handleContextMenuRuleOptionSelect = useCallback(
    (key: React.Key, log: RQNetworkLog) => {
      const ruleData = {
        id: log.id,
        url: log.entry.request.url,
        request: { body: log.entry.request.postData.text },
        response: { body: log.entry.response.content.text },
      };

      dispatch(
        globalActions.toggleActiveModal({
          newValue: true,
          modalName: "ruleEditorModal",
          newProps: { ruleData, ruleType: key },
        })
      );

      trackRuleCreationWorkflowStartedEvent(key, "modal");
      trackSessionRecordingNetworkLogContextMenuOptionClicked(`${snakeCase(key as string)}_rule`);
    },
    [dispatch]
  );

  const handleCloseRuleEditorModal = useCallback(() => {
    dispatch(
      globalActions.toggleActiveModal({
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
          disabled: isLocalSyncEnabled,
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
          label: "Redirect URL (Map local/Remote)",
          disabled: isLocalSyncEnabled,
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.RESPONSE,
          label: "Modify Response Body",
          disabled: isLocalSyncEnabled,
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.REQUEST,
          label: "Modify Request Body",
          disabled: isLocalSyncEnabled,
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.HEADERS,
          label: "Modify Headers",
          disabled: isLocalSyncEnabled,
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.REPLACE,
          label: "Replace part of URL",
          disabled: isLocalSyncEnabled,
          onSelect: handleContextMenuRuleOptionSelect,
        },

        {
          key: RuleType.CANCEL,
          label: "Cancel Request",
          disabled: isLocalSyncEnabled,
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.SCRIPT,
          label: "Insert Custom Script",
          disabled: isLocalSyncEnabled,
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.DELAY,
          label: "Delay Request",
          disabled: isLocalSyncEnabled,
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.QUERYPARAM,
          label: "Modify Query Params",
          disabled: isLocalSyncEnabled,
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.USERAGENT,
          label: "Modify User Agent",
          disabled: isLocalSyncEnabled,
          onSelect: handleContextMenuRuleOptionSelect,
        },
      ] as RQNetworkTableProps["contextMenuOptions"],
    [handleContextMenuRuleOptionSelect, isLocalSyncEnabled]
  );

  const handleCloseApiClientModal = useCallback(() => {
    setIsApiClientModalOpen(false);
    setSelectedRequestData(null);
  }, []);

  const emptyTableView = (
    <Row className="empty-table-view subtitle" align="middle" justify="center">
      No request matches the search query!
    </Row>
  );

  return (
    <div className="session-panel-content network-logs-panel">
      {networkLogs.length > 0 ? (
        <>
          <RQNetworkTable
            logs={networkLogs}
            contextMenuOptions={options}
            sessionRecordingStartTime={startTime}
            sessionCurrentOffset={playerTimeOffset}
            onContextMenuOpenChange={(isOpen) => {
              if (isOpen) trackSessionRecordingNetworkLogContextMenuOpen();
            }}
            emptyView={emptyTableView}
            autoScroll
            disableFilters={disableFilters}
          />

          {isApiClientModalOpen && (
            <APIClientModal
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
