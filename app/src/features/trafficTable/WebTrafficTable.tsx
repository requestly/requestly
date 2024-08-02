import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
import { startInterception, stopInterception } from "actions/ExtensionActions";
import { RQNetworkLog } from "lib/design-system/components/RQNetworkTable/types";
import "./webNetworkTable.scss";
import { Button, Space } from "antd";
import {
  GenericNetworkTable,
  GenericNetworkTableProps,
} from "lib/design-system/components/RQNetworkTable/GenericNetworkTable";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "store";
import { getActiveModals } from "store/selectors";
import { APIClient, APIClientRequest } from "components/common/APIClient";
import { copyToClipBoard } from "utils/Misc";
import { RuleType } from "types";
import { RQNetworkTableProps } from "lib/design-system/components/RQNetworkTable";
import RuleEditorModal from "components/common/RuleEditorModal";

const extraColumns: GenericNetworkTableProps<RQNetworkLog>["extraColumns"] = [
  {
    key: "resourceType",
    header: "Resource Type",
    width: 7,
    priority: 4,
    render: (log) => {
      return <span>{log.entry.response.type}</span>;
    },
  },
];

const WebTrafficTable: React.FC = () => {
  const dispatch = useDispatch();
  const { ruleEditorModal } = useSelector(getActiveModals);

  const [isInterceptionStarted, setIsInterceptionStarted] = useState(false);
  const [logs, setLogs] = useState<RQNetworkLog[]>([]);
  const [isApiClientModalOpen, setIsApiClientModalOpen] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState<APIClientRequest>(null);

  const handleContextMenuRuleOptionSelect = useCallback(
    (key: React.Key, log: RQNetworkLog) => {
      const ruleData = {
        id: log.id,
        url: log.entry.request.url,
        request: { body: log.entry.request.postData.text },
        response: { body: log.entry.response.content.text },
      };

      dispatch(
        actions.toggleActiveModal({
          newValue: true,
          modalName: "ruleEditorModal",
          newProps: { ruleData, ruleType: key },
        })
      );

      // trackRuleCreationWorkflowStartedEvent(key, "modal");
      // trackSessionRecordingNetworkLogContextMenuOptionClicked(`${snakeCase(key as string)}_rule`);
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
            // trackSessionRecordingNetworkLogContextMenuOptionClicked(key);
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

            // trackSessionRecordingNetworkLogContextMenuOptionClicked(key);
            setIsApiClientModalOpen(true);
          },
        },
        {
          type: "divider",
        },
        {
          key: RuleType.REDIRECT,
          label: "Redirect URL (Map local/Remote)",
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.RESPONSE,
          label: "Modify Response Body",
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.REQUEST,
          label: "Modify Request Body",
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.HEADERS,
          label: "Modify Headers",
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.REPLACE,
          label: "Replace part of URL",
          onSelect: handleContextMenuRuleOptionSelect,
        },

        {
          key: RuleType.CANCEL,
          label: "Cancel Request",
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.SCRIPT,
          label: "Insert Custom Script",
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.DELAY,
          label: "Delay Request",
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.QUERYPARAM,
          label: "Modify Query Params",
          onSelect: handleContextMenuRuleOptionSelect,
        },
        {
          key: RuleType.USERAGENT,
          label: "Modify User Agent",
          onSelect: handleContextMenuRuleOptionSelect,
        },
      ] as RQNetworkTableProps["contextMenuOptions"],
    [handleContextMenuRuleOptionSelect]
  );

  const handleCloseApiClientModal = useCallback(() => {
    setIsApiClientModalOpen(false);
    setSelectedRequestData(null);
  }, []);

  const handleStartInterception = useCallback(() => {
    startInterception();
    setIsInterceptionStarted(true);
  }, []);

  const handleStopInterception = useCallback(() => {
    stopInterception();
    setIsInterceptionStarted(false);
  }, []);

  useEffect(() => {
    PageScriptMessageHandler.addMessageListener("webRequestIntercepted", (message) => {
      console.log("!!!debug", "message in port webApp", message);
      const { requestDetails } = message;
      setLogs((prevLogs) => {
        return [
          ...prevLogs,
          {
            id: requestDetails.requestId,
            entry: {
              startedDateTime: new Date(requestDetails.timeStamp).toLocaleTimeString(),
              request: {
                url: requestDetails.url,
                method: requestDetails.method,
                headers: requestDetails.requestHeaders ?? [],
                queryString: [],
                postData: {
                  text: JSON.stringify(requestDetails.rqRequestBody),
                },
              },
              response: {
                headers: requestDetails.responseHeaders ?? [],
                status: requestDetails.statusCode,
                content: {
                  text: requestDetails.responseBody || "",
                },
                type: requestDetails.type,
              },
            },
          },
        ];
      });
    });

    return () => {
      stopInterception();
      PageScriptMessageHandler.removeMessageListener("webRequestIntercepted");
    };
  }, []);

  return (
    <>
      <div className="web-traffic-table-screen">
        <div className="header-row">
          <Space>
            <span className="title">Network Traffic</span>
            <span>{`Showing ${logs?.length ?? 0} logs`}</span>
          </Space>
          <Button
            onClick={isInterceptionStarted ? handleStopInterception : handleStartInterception}
            type={"primary"}
            danger={isInterceptionStarted}
          >{`${isInterceptionStarted ? "Stop" : "Start"} Interception`}</Button>
        </div>
        <div className="web-traffic-table-container rq-network-table-container">
          <GenericNetworkTable
            logs={logs}
            extraColumns={extraColumns}
            excludeColumns={["contentType", "time"]}
            networkEntrySelector={(log: RQNetworkLog) => log.entry}
            contextMenuOptions={options}
            autoScroll={true}
            // onContextMenuOpenChange={onContextMenuOpenChange}
            // emptyView={emptyView}
            // rowStyle={(log: RQNetworkLog) => (isLogPending(log) ? { opacity: 0.45 } : {})}
            // autoScroll={autoScroll}
            // tableRef={containerRef}
            // onTableScroll={onScroll}
            // disableFilters={disableFilters}
          />
        </div>
      </div>
      {logs?.length > 0 && (
        <>
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
      )}
    </>
  );
};

export default WebTrafficTable;
