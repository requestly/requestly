import { ReactElement } from "react";
import type { ColumnsType } from "antd/es/table";
import { Table, TableProps } from "antd";
import { BulkActionBarConfig } from "./types";
import BulkActionBar from "./components/BulkActionBar/BulkActionBar";
import "./contentListTable.scss";
import { useContentListTableContext } from "./context";

export interface ContentTableProps<DataType> extends TableProps<DataType> {
  columns: ColumnsType<DataType>;
  data: DataType[];
  rowKey?: string; // Primary Key of the Table Row Data. Use for selection of row. Defaults to 'key'
  loading?: boolean;
  customRowClassName?: (record: DataType) => string;
  bulkActionBarConfig?: BulkActionBarConfig<DataType>;
  locale: TableProps<DataType>["locale"];
  onRecordSelection?: (selectedRows: DataType[]) => void;
}

const ContentListTable = <DataType extends object>({
  columns,
  data,
  rowKey = "key",
  loading = false,
  customRowClassName = (record: DataType) => "",
  bulkActionBarConfig,
  size = "middle",
  scroll = { y: "calc(100vh - 277px)" },
  expandable,
  locale,
  onRecordSelection = () => {},
}: ContentTableProps<DataType>): ReactElement => {
  const { selectedRows, setSelectedRows } = useContentListTableContext();

  return (
    <>
      {bulkActionBarConfig && <BulkActionBar config={bulkActionBarConfig} selectedRows={selectedRows} />}
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
          selectedRowKeys: selectedRows.map((record) => (record as any)[rowKey]),
          onChange: (selectedRowKeys, selectedRows) => {
            onRecordSelection(selectedRows);
            setSelectedRows(selectedRows);
          },
        }}
      />
    </>
  );
};

export default ContentListTable;
