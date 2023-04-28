import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "store";
import { getIsTrafficTableTourCompleted } from "store/selectors";
import { Table } from "@devtools-ds/table";
import _ from "lodash";
import { getColumnKey } from "../utils";
import { VirtualTable } from "./VirtualTable";
import AppliedRules from "../../Tables/columns/AppliedRules";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import FEATURES from "config/constants/sub/features";
import { FixedSizeList } from "react-window";

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
  const [selectedRowData, setSelectedRowData] = useState({});
  const dispatch = useDispatch();
  const isTrafficTableTourCompleted = useSelector(getIsTrafficTableTourCompleted);


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

  const renderLogRow = (log: any, index: number, style: any) => {
    if (!log) {
      return null;
    }

    const rowProps = onRow(log);

    return (
      <Table.Row
        id={log.id}
        onContextMenu={() => setSelectedRowData(log)}
        {...rowProps}
        data-tour-id={index === 0 ? "traffic-table-row" : null}
      >
        {columns.map((column: any) => {
          const columnData = _.get(log, getColumnKey(column?.dataIndex));

          return <Table.Cell style={{width: column?.width}} key={column.id}>{column?.render ? column.render(columnData) : columnData}</Table.Cell>;
        })}
      </Table.Row>
    );
  };

  const Row = ({ index, style }: any) => {
    return renderLogRow(logs[index], index, style);
  };

  return (
    <>
      <ProductWalkthrough
        tourFor={FEATURES.DESKTOP_APP_TRAFFIC_TABLE}
        startWalkthrough={!isTrafficTableTourCompleted}
        onTourComplete={() => dispatch(actions.updateTrafficTableTourCompleted({}))}
      />
      {/* <VirtualTable
        height="100%"
        width="100%"
        itemCount={logs?.length ?? 0}
        itemSize={ITEM_SIZE}
        header={renderHeader()}
        row={Row}
        footer={null}
        selectedRowData={selectedRowData}
      /> */}

      <FixedSizeList
        itemCount={1000}
        itemSize={ITEM_SIZE}
        overscanCount={15}
        height={1000}
        width={1000}
        innerElementType={Inner}
        outerElementType={Outer}
      >
        {Row}
      </FixedSizeList>
    </>
  );
};

export const Outer = (props: any) => {
  return (
    <Table style={{
      display: "block",
    }}>
      <Table.Head style={{ zIndex: 1000 }}>
        <Table.Row>
          {columns.map((column: any) => (
            <Table.HeadCell key={column.id} style={{ width: column.width, position: "sticky", top: 0 }}>
              {column.title}
            </Table.HeadCell>
          ))}
        </Table.Row>
      </Table.Head>
      {props.children}
    </Table>
  );
}

export const Inner = (props: any) => {
  return (
    <Table.Body style={{
        display: "block",
        overflow: "auto",
        width: "100%"
    }}>
      {props.children}
    </Table.Body>
  );
}

export default NetworkTable;
