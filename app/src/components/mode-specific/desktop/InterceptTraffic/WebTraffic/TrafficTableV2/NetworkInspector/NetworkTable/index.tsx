import React, { useCallback, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "store";
import { getIsTrafficTableTourCompleted, getIsConnectedAppsTourCompleted } from "store/selectors";
import { Table } from "@devtools-ds/table";
import _ from "lodash";
import { getColumnKey } from "../utils";
import { VirtualTable } from "./VirtualTable";
import AppliedRules from "../../Tables/columns/AppliedRules";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import FEATURES from "config/constants/sub/features";
import { TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import VirtualTableV2 from "./VirtualTableV2";
import { APIClient, APIClientRequest } from "components/common/APIClient";
import { RQNetworkLog } from "../../../TrafficExporter/harLogs/types";
import { Checkbox, Tooltip } from "antd";
import { trackMockResponsesRequestsSelected } from "modules/analytics/events/features/sessionRecording/mockResponseFromSession";

export const ITEM_SIZE = 30;

interface Props {
  logs: any;
  onRow: Function;
  isStaticPreview: boolean;
  setSelectedMockRequests?: Function;
  showMockRequestSelector?: boolean;
  isMockRequestSelectorDisabled?: boolean;
  selectedMockRequests?: Record<string, any>;
}

const NetworkTable: React.FC<Props> = ({
  logs,
  onRow,
  isStaticPreview,
  setSelectedMockRequests,
  showMockRequestSelector,
  isMockRequestSelectorDisabled,
  selectedMockRequests,
}) => {
  const [selectedRowData, setSelectedRowData] = useState<RQNetworkLog>();
  const [isReplayRequestModalOpen, setIsReplayRequestModalOpen] = useState(false);
  const dispatch = useDispatch();
  const isTrafficTableTourCompleted = useSelector(getIsTrafficTableTourCompleted);
  const isConnectedAppsTourCompleted = useSelector(getIsConnectedAppsTourCompleted);
  const isTrafficTableVirtualV2Enabled = useFeatureIsOn("traffic_table_virtualization_v2");
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
        title: "",
        dataIndex: "id",
        width: "4%",
        hideColumn: !showMockRequestSelector,
        render: (id: string, log: Record<string, any>) => {
          return (
            <Tooltip title={isMockRequestSelectorDisabled ? "Please fill all the conditions to select requests." : ""}>
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
                  disabled={isMockRequestSelectorDisabled}
                  checked={selectedMockRequests?.[id]}
                />
              </div>
            </Tooltip>
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
      },
      {
        id: "method",
        title: "Method",
        dataIndex: ["request", "method"], // corresponds to request.method
        width: "8%",
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
    [
      isMockRequestSelectorDisabled,
      isStaticPreview,
      selectedMockRequests,
      setSelectedMockRequests,
      showMockRequestSelector,
    ]
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
                {column.title}
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
            const columnData = _.get(log, getColumnKey(column?.dataIndex));

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
        onTourComplete={() => dispatch(actions.updateProductTourCompleted({ tour: TOUR_TYPES.TRAFFIC_TABLE }))}
      />
      {isTrafficTableVirtualV2Enabled ? (
        <VirtualTableV2
          header={header}
          renderLogRow={renderLogRow}
          logs={logs}
          selectedRowData={selectedRowData}
          onReplayRequest={onReplayRequest}
        />
      ) : (
        <VirtualTable
          height="100%"
          width="100%"
          itemCount={logs?.length ?? 0}
          itemSize={ITEM_SIZE}
          header={header}
          row={({ index }) => renderLogRow(logs[index], index)}
          footer={null}
          selectedRowData={selectedRowData}
          onReplayRequest={onReplayRequest}
        />
      )}
      {isReplayRequestModalOpen ? (
        <APIClient
          request={apiClientRequestForSelectedRowRef.current}
          openInModal
          modalTitle="Replay request"
          isModalOpen
          onModalClose={onReplayRequestModalClose}
        />
      ) : null}
    </>
  );
};

export default NetworkTable;
