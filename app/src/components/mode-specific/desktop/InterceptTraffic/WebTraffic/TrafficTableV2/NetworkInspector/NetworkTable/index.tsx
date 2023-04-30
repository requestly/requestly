import React, { useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "store";
import { getIsTrafficTableTourCompleted } from "store/selectors";
import { Table } from "@devtools-ds/table";
import _ from "lodash";
import { getColumnKey } from "../utils";
import AppliedRules from "../../Tables/columns/AppliedRules";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import FEATURES from "config/constants/sub/features";
import { useVirtualizer } from "@tanstack/react-virtual";
import AutoSizer from "react-virtualized-auto-sizer";
import "./index.css";
import { ContextMenu } from "../ContextMenu";

export const ITEM_SIZE = 30;

interface Props {
  logs: any;
  onRow: Function;
}
const columns = [
  {
    id: "time",
    title: "Time",
    dataIndex: "timestamp",
    width: "7%",
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
    width: "5%",
  },
  {
    id: "contentType",
    title: "Content-Type",
    dataIndex: ["response", "contentType"],
    width: "10%",
  },
  {
    title: "Rules Applied",
    dataIndex: ["actions"],
    width: "10%",
    responsive: ["xs", "sm"],
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
    width: "5%",
  },
];

const NetworkTable: React.FC<Props> = ({ logs, onRow }) => {
  const [selected, setSelected] = useState(null); // Selection for ds-devtools
  const [selectedRowData, setSelectedRowData] = useState({});
  const dispatch = useDispatch();
  const isTrafficTableTourCompleted = useSelector(getIsTrafficTableTourCompleted);

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_SIZE,
    overscan: 5,
  });

  // https://github.com/bvaughn/react-window/issues/60#issuecomment-781540658
  const items = rowVirtualizer.getVirtualItems();
  const paddingTop = items.length > 0 ? items[0].start : 0;
  const paddingBottom = items.length > 0 ? rowVirtualizer.getTotalSize() - items[items.length - 1].end : 0;

  const renderHeader = () => {
    return (
      <Table.Head style={{ zIndex: 1000 }}>
        <Table.Row>
          {columns.map((column: any) => (
            <Table.HeadCell key={column.id} style={{ width: column.width, position: "sticky", top: 0 }}>
              {column.title}
            </Table.HeadCell>
          ))}
        </Table.Row>
      </Table.Head>
    );
  };

  const renderLogRow = (log: any, index: number) => {
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
        data-tour-id={index === 0 ? "traffic-table-row" : null}
      >
        {columns.map((column: any) => {
          const columnData = _.get(log, getColumnKey(column?.dataIndex));

          return <Table.Cell key={column.id}>{column?.render ? column.render(columnData) : columnData}</Table.Cell>;
        })}
      </Table.Row>
    );
  };

  return (
    <>
      <ProductWalkthrough
        tourFor={FEATURES.DESKTOP_APP_TRAFFIC_TABLE}
        startWalkthrough={!isTrafficTableTourCompleted}
        onTourComplete={() => dispatch(actions.updateTrafficTableTourCompleted({}))}
      />
      <AutoSizer>
        {({ height, width }) => {
          return (
            <div
              ref={parentRef}
              style={{
                height: height,
                width: width,
                overflow: "auto",
              }}
            >
              <Table
                id="vtable"
                style={
                  {
                    "--virtualPaddingTop": paddingTop + "px",
                    "--virtualPaddingBottom": paddingBottom + "px",
                  } as React.CSSProperties
                }
                selected={selected}
                onSelected={(id: string) => {
                  setSelected(id);
                }}
              >
                {renderHeader()}
                <ContextMenu log={selectedRowData}>
                  <Table.Body id="vtbody" style={{}}>
                    {/* Hack to fix alternate colors flickering due to virtualization*/}
                    {rowVirtualizer.getVirtualItems()?.[0]?.index % 2 === 0 ? null : <tr></tr>}

                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const log = logs[virtualRow.index];
                      return renderLogRow(log, virtualRow.index);
                    })}
                  </Table.Body>
                </ContextMenu>
              </Table>
            </div>
          );
        }}
      </AutoSizer>
    </>
  );
};

export default NetworkTable;
