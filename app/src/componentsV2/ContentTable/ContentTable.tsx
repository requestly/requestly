import React, { ReactElement, useCallback, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Table, TableProps } from "antd";
import { BulkActionBarConfig } from "./types";
import BulkActionBar from "./components/BulkActionBar/BulkActionBar";
import { RiArrowDownSLine } from "@react-icons/all-files/ri/RiArrowDownSLine";
import "./contentTable.scss";

export interface ContentTableProps<DataType> extends Partial<Pick<TableProps<DataType>, "scroll" | "size">> {
  columns: ColumnsType<DataType>;
  data: DataType[];
  rowKey?: string; // Primary Key of the Table Row Data. Use for selection of row. Defaults to 'key'
  loading?: boolean;
  customRowClassName?: (record: DataType) => string;
  bulkActionBarConfig?: BulkActionBarConfig;
}

const ContentTable = <DataType extends object>({
  columns,
  data,
  rowKey = "key",
  loading = false,
  customRowClassName = (record: DataType) => "",
  bulkActionBarConfig,
  size = "middle",
  scroll = { y: "calc(100vh - 277px)" },
}: ContentTableProps<DataType>): ReactElement => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowsData, setSelectedRowsData] = useState<DataType[]>([]);

  const clearSelectedRowsData = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRowsData([]);
    bulkActionBarConfig?.options?.clearSelectedRows?.();
  }, [bulkActionBarConfig?.options]);

  return (
    <>
      {bulkActionBarConfig && (
        <BulkActionBar
          config={bulkActionBarConfig}
          selectedRows={selectedRowsData}
          clearSelectedRowsData={clearSelectedRowsData}
        />
      )}
      <Table
        className="rq-content-table"
        onHeaderRow={() => ({
          className: "rq-content-table-header",
        })}
        rowClassName={(record) => `rq-content-table-row ${customRowClassName?.(record)}`}
        size={size}
        loading={loading}
        rowKey={rowKey}
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={scroll}
        expandable={{
          expandRowByClick: true,
          rowExpandable: () => true,
          expandIcon: ({ expanded, onExpand, record }) => (
            <RiArrowDownSLine
              // @ts-ignore
              onClick={(e) => onExpand(record, e)}
              className="group-expand-icon"
              style={{ transform: `rotate(${expanded ? "-180deg" : "0deg"})` }}
            />
          ),
        }}
        rowSelection={{
          selectedRowKeys,
          checkStrictly: false,
          onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedRowsData(selectedRows);
          },
        }}
      />
    </>
  );
};

export default ContentTable;
