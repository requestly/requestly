import { ReactElement, useCallback, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Table, TableProps } from "antd";
import { BulkActionBarConfig } from "./types";
import BulkActionBar from "./components/BulkActionBar/BulkActionBar";
import "./contentTable.scss";

export interface ContentTableProps<DataType> extends TableProps<DataType> {
  columns: ColumnsType<DataType>;
  data: DataType[];
  rowKey?: string; // Primary Key of the Table Row Data. Use for selection of row. Defaults to 'key'
  loading?: boolean;
  customRowClassName?: (record: DataType) => string;
  bulkActionBarConfig?: BulkActionBarConfig<DataType>;
  filterSelection?: (records: DataType[]) => DataType[];
  locale: TableProps<DataType>["locale"];
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
  filterSelection = (records) => records,
  expandable,
  locale,
}: ContentTableProps<DataType>): ReactElement => {
  const [selectedRowsData, setSelectedRowsData] = useState<DataType[]>([]);

  const clearSelectedRowsData = useCallback(() => {
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
        expandable={expandable}
        locale={locale}
        rowSelection={{
          checkStrictly: false,
          selectedRowKeys: selectedRowsData.map((record) => (record as any).id),
          onChange: (selectedRowKeys, selectedRows) => {
            const selectedRowsData = filterSelection(selectedRows);
            setSelectedRowsData(selectedRowsData);
          },
        }}
      />
    </>
  );
};

export default ContentTable;
