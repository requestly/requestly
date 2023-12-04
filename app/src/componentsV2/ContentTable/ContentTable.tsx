import React, { ReactElement, useCallback, useEffect, useState } from "react";
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

  bulkActionBarConfig?: BulkActionBarConfig;
}

const ContentTable = <DataType extends object>({
  columns,
  data,
  rowKey = "key",
  loading = false,
  bulkActionBarConfig,
}: ContentTableProps<DataType>): ReactElement => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowsData, setSelectedRowsData] = useState<DataType[]>([]);
  const [filteredRowsData, setFilteredRowsData] = useState(data);

  useEffect(() => {
    setFilteredRowsData([...data]);
  }, [data]);

  useEffect(() => {
    bulkActionBarConfig?.options?.getSelectedRowsData?.(selectedRowsData);
  }, [bulkActionBarConfig?.options, selectedRowsData]);

  const clearSelectedRowsData = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRowsData([]);
  }, []);

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
        rowClassName="rq-content-table-row"
        loading={loading}
        rowKey={rowKey}
        columns={columns}
        dataSource={filteredRowsData}
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
