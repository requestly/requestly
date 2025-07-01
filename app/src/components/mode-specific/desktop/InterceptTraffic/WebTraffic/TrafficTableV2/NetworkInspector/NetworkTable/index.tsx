import React, { useCallback, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { getIsTrafficTableTourCompleted, getIsConnectedAppsTourCompleted } from "store/selectors";
import { Table } from "@devtools-ds/table";
import { get } from "lodash";
import { getColumnKey } from "../utils";
import AppliedRules from "../../Tables/columns/AppliedRules";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import FEATURES from "config/constants/sub/features";
import VirtualTableV2 from "./VirtualTableV2";
import { APIClientRequest } from "features/apiClient/components/common/APIClient";
import { RQNetworkLog } from "../../../TrafficExporter/harLogs/types";
import { Checkbox, Typography } from "antd";
import { trackMockResponsesRequestsSelected } from "modules/analytics/events/features/sessionRecording/mockResponseFromSession";
import { REQUEST_METHOD_COLORS, RequestMethod } from "../../../../../../../../constants/requestMethodColors";
import "./index.scss";
import { TOUR_TYPES } from "components/misc/ProductWalkthrough/types";
import { APIClientModal } from "features/apiClient/components/common/APIClient";

export const ITEM_SIZE = 30;

interface Props {
  logs: any;
  onRow: Function;
  isStaticPreview: boolean;
  setSelectedMockRequests?: Function;
  showMockRequestSelector?: boolean;
  selectedMockRequests?: Record<string, any>;
}

const NetworkTable: React.FC<Props> = ({
  logs,
  onRow,
  isStaticPreview,
  setSelectedMockRequests,
  showMockRequestSelector,
  selectedMockRequests,
}) => {
  const [selectedRowData, setSelectedRowData] = useState<RQNetworkLog>();
  const [isReplayRequestModalOpen, setIsReplayRequestModalOpen] = useState(false);
  const dispatch = useDispatch();
  const isTrafficTableTourCompleted = useSelector(getIsTrafficTableTourCompleted);
  const isConnectedAppsTourCompleted = useSelector(getIsConnectedAppsTourCompleted);
  const apiClientRequestForSelectedRowRef = useRef<APIClientRequest>(null);

  const onReplayRequest = useCallback(() => {
    apiClientRequestForSelectedRowRef.current = {
      url: selectedRowData.url,
      headers: selectedRowData.request.headers,
      method: selectedRowData.request.method,
      body: selectedRowData.request.body,
    };
    setIsReplayRequestModalOpen(true);
  }, [selectedRowData]);

  const onReplayRequestModalClose = useCallback(() => {
    apiClientRequestForSelectedRowRef.current = null;
    setIsReplayRequestModalOpen(false);
  }, []);

  const columns = useMemo(
    () => [
      {
        title: () => {
          return (
            <div className="display-row-center">
              <Checkbox
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={(e) => {
                  e.stopPropagation();
                  if (e.target.checked) {
                    const selectedRequests = logs.reduce((acc: Record<string, any>, log: Record<string, any>) => {
                      acc[log.id] = log;
                      return acc;
                    }, {});
                    setSelectedMockRequests((prev: Record<string, any>) => ({ ...prev, ...selectedRequests }));
                  } else {
                    setSelectedMockRequests((prev: Record<string, any>) => {
                      const prevMockRequests = { ...prev };
                      const requestsAfterUnselection = logs.reduce(
                        (acc: Record<string, any>, log: Record<string, any>) => {
                          delete acc[log.id];
                          return acc;
                        },
                        prevMockRequests
                      );
                      return requestsAfterUnselection;
                    });
                  }
                  trackMockResponsesRequestsSelected(Object.keys(selectedMockRequests)?.length);
                }}
                checked={logs.every((log: Record<string, any>) => log.id && log.id in selectedMockRequests)}
              />
            </div>
          );
        },
        dataIndex: "id",
        width: "4%",
        hideColumn: !showMockRequestSelector,
        render: (id: string, log: Record<string, any>) => {
          return (
            // <Tooltip title={isMockRequestSelectorDisabled ? "Please fill all the conditions to select requests." : ""}>
            <div className="display-row-center">
              <Checkbox
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onChange={(e) => {
                  e.stopPropagation();
                  if (e.target.checked) {
                    setSelectedMockRequests((prev: Record<string, any>) => ({ ...prev, [id]: log }));
                  } else {
                    setSelectedMockRequests((prev: Record<string, any>) => {
                      const newMockRequests = { ...prev };
                      delete newMockRequests[id];
                      return newMockRequests;
                    });
                  }
                  trackMockResponsesRequestsSelected(Object.keys(selectedMockRequests)?.length);
                }}
                // disabled={isMockRequestSelectorDisabled}
                checked={selectedMockRequests?.[id]}
              />
            </div>
            // </Tooltip>
          );
        },
      },
      {
        id: "time",
        title: "Time",
        dataIndex: "timestamp",
        width: "8%",
        render: (timestamp: any) => {
          return new Date(timestamp * 1000).toLocaleTimeString(undefined, {
            hour12: false,
          });
        },
      },
      {
        id: "url",
        title: "URL",
        dataIndex: "url",
        width: "48%",
        render: (url: string, log: RQNetworkLog) => {
          if (log?.metadata?.GQLDetails) {
            const { operationName } = log.metadata.GQLDetails;
            return (
              <div className="url-wrapper">
                <span className="url">{url}</span>
                <span className="graphql-operation-name">{`(${operationName})`}</span>
              </div>
            );
          }

          return url;
        },
      },
      {
        id: "method",
        title: "Method",
        dataIndex: ["request", "method"], // corresponds to request.method
        width: "8%",
        render(method: RequestMethod) {
          return (
            <Typography.Text className="api-method" style={{ color: REQUEST_METHOD_COLORS[method] }}>
              {method}
            </Typography.Text>
          );
        },
      },
      {
        id: "contentType",
        title: "Content-Type",
        dataIndex: ["response", "contentType"],
        width: "16%",
      },
      {
        id: "rulesApplied",
        title: "Rules Applied",
        dataIndex: ["actions"],
        width: "8%",
        responsive: ["xs", "sm"],
        hideColumn: isStaticPreview,
        render: (actions: any) => {
          if (!actions || actions === "-" || actions.length === 0) {
            return "-";
          }
          return <AppliedRules actions={actions} />;
        },
      },
      {
        id: "status",
        title: "Status",
        dataIndex: ["response", "statusCode"],
        width: "7%",
      },
    ],
    [isStaticPreview, logs, selectedMockRequests, setSelectedMockRequests, showMockRequestSelector]
  );

  const header = useMemo(() => {
    return (
      <Table.Head style={{ zIndex: 1000 }}>
        <Table.Row>
          {columns.map((column: any) => {
            if (column.hideColumn === true) {
              return null;
            }
            return (
              <Table.HeadCell title={column.title} key={column.id} style={{ width: column.width }}>
                {typeof column.title === "function" ? column.title() : column.title}
              </Table.HeadCell>
            );
          })}
        </Table.Row>
      </Table.Head>
    );
  }, [columns]);

  const renderLogRow = useCallback(
    (log: any, index: number) => {
      if (!log) {
        return null;
      }

      const rowProps = onRow(log);

      return (
        <Table.Row
          key={index}
          id={log.id}
          onContextMenu={() => setSelectedRowData(log)}
          {...rowProps}
          data-tour-id={index === 0 && !isTrafficTableTourCompleted ? "traffic-table-row" : null}
        >
          {columns.map((column: any) => {
            if (column.hideColumn === true) {
              return null;
            }
            const columnData = get(log, getColumnKey(column?.dataIndex));
            return (
              <Table.Cell key={column.id} title={!column?.render ? columnData : ""}>
                {column?.render ? column.render(columnData, log) : columnData}
              </Table.Cell>
            );
          })}
        </Table.Row>
      );
    },
    [columns, isTrafficTableTourCompleted, onRow]
  );

  return (
    <>
      <ProductWalkthrough
        tourFor={FEATURES.DESKTOP_APP_TRAFFIC_TABLE}
        startWalkthrough={!isTrafficTableTourCompleted && isConnectedAppsTourCompleted}
        onTourComplete={() => dispatch(globalActions.updateProductTourCompleted({ tour: TOUR_TYPES.TRAFFIC_TABLE }))}
      />
      <div className="web-traffic-table-container">
        <VirtualTableV2
          header={header}
          renderLogRow={renderLogRow}
          logs={logs}
          selectedRowData={selectedRowData}
          onReplayRequest={onReplayRequest}
        />
      </div>
      {isReplayRequestModalOpen ? (
        <APIClientModal
          request={apiClientRequestForSelectedRowRef.current}
          isModalOpen
          onModalClose={onReplayRequestModalClose}
        />
      ) : null}
    </>
  );
};

export default NetworkTable;
