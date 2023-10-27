import React, { ReactElement, useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Table } from "antd";
import { BulkActionBarConfig } from "./types";
import BulkActionBar from "./components/BulkActionBar/BulkActionBar";

export interface ContentTableProps<DataType> {
  columns: ColumnsType<DataType>;
  data: DataType[];
  rowKey?: string; // Primary Key of the Table Row Data. Use for selection of row. Defaults to 'key'

  bulkActionBarConfig?: BulkActionBarConfig;
}

const ContentTable = <DataType extends object>({
  columns,
  data,
  bulkActionBarConfig,
  rowKey = "key",
}: ContentTableProps<DataType>): ReactElement => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowsData, setSelectedRowsData] = useState<DataType[]>([]);
  const [filteredRowsData, setFilteredRowsData] = useState(data);

  useEffect(() => {
    setFilteredRowsData([...data]);
  }, [data]);

  return (
    <>
      {bulkActionBarConfig && <BulkActionBar config={bulkActionBarConfig} selectedRows={selectedRowsData} />}
      <Table
        rowKey={rowKey}
        columns={columns}
        dataSource={filteredRowsData}
        pagination={false}
        rowSelection={{
          selectedRowKeys,
          onChange: (selectedRowKeys, selectedRows) => {
            console.log({ selectedRowKeys });
            setSelectedRowKeys(selectedRowKeys);
            setSelectedRowsData(selectedRows);
          },
        }}
      />
    </>
  );
};

export default ContentTable;
