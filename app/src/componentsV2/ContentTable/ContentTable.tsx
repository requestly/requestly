import { ReactElement, useCallback, useState } from "react";
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
  filterSelection?: (records: DataType[]) => DataType[];
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
