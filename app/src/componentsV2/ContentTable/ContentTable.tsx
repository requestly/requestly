import React, { ReactElement, useCallback, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Table } from "antd";
import { BulkActionBarConfig } from "./types";
import BulkActionBar from "./components/BulkActionBar/BulkActionBar";
import "./contentTable.scss";

export interface ContentTableProps<DataType> {
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
        loading={loading}
        rowKey={rowKey}
        columns={columns}
        dataSource={data}
        pagination={false}
        rowSelection={{
          selectedRowKeys,
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
