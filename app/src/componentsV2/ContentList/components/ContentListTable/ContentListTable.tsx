import { ReactElement, useCallback, useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Table, TableProps } from "antd";
import { BulkActionBarConfig } from "./types";
import BulkActionBar from "./components/BulkActionBar/BulkActionBar";
import "./contentListTable.scss";
import { useContentListTableContext } from "./context";
import Logger from "lib/logger";

export interface ContentListTableProps<DataType> extends TableProps<DataType> {
  id: string;
  columns: ColumnsType<DataType>;
  data: DataType[];
  rowKey?: string; // Primary Key of the Table Row Data. Use for selection of row. Defaults to 'key'
  loading?: boolean;
  customRowClassName?: (record: DataType) => string;
  bulkActionBarConfig?: BulkActionBarConfig<DataType>;
  locale: TableProps<DataType>["locale"];
  onRecordSelection?: (selectedRows: DataType[]) => void;
}

const ContentListTable = <DataType extends { [key: string]: any }>({
  id,
  columns,
  data,
  rowKey = "key",
  loading = false,
  customRowClassName = (record: DataType) => "",
  bulkActionBarConfig,
  size = "middle",
  scroll = { y: "calc(100vh - 277px)" },
  locale,
  onRecordSelection = () => {},
  className = "",
  onRow = (record: DataType) => ({}),
}: ContentListTableProps<DataType>): ReactElement => {
  const { selectedRows, setSelectedRows } = useContentListTableContext();
  const [expandedRowKeys, setExpandedRowsKeys] = useState<string[]>([]);

  const handleOnExpandClick = useCallback(
    (expanded: boolean, record: DataType) => {
      Logger.log("handleOnExpandClick", expanded, record);
      let updatedExpandedRowKeys = new Set(expandedRowKeys);
      if (expanded) {
        updatedExpandedRowKeys = updatedExpandedRowKeys.add(record[rowKey]);
      } else {
        updatedExpandedRowKeys.delete(record[rowKey]);
      }
      setExpandedRowsKeys(Array.from(updatedExpandedRowKeys));
      localStorage.setItem(
        "content-list-table-expanded-rows",
        JSON.stringify({
          [id]: Array.from(updatedExpandedRowKeys),
        })
      );
    },
    [expandedRowKeys, id, rowKey]
  );

  useEffect(() => {
    const expandedRowsData = localStorage.getItem("content-list-table-expanded-rows");
    const currentListTableExpandedRows = expandedRowsData ? JSON.parse(expandedRowsData)[id] : [];
    if (currentListTableExpandedRows) {
      setExpandedRowsKeys(currentListTableExpandedRows);
    }
  }, [id]);

  return (
    <div className="rq-content-list-table-container">
      {bulkActionBarConfig && <BulkActionBar config={bulkActionBarConfig} selectedRows={selectedRows} />}
      <Table
        className={`rq-content-list-table ${className}`}
        onHeaderRow={() => ({
          className: "rq-content-list-table-header",
        })}
        rowClassName={(record) => `rq-content-list-table-row ${customRowClassName?.(record)}`}
        onRow={onRow}
        size={size}
        loading={loading}
        rowKey={rowKey}
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={scroll}
        locale={locale}
        rowSelection={bulkActionBarConfig ? { selectedRowKeys: selectedRows, onChange: setSelectedRows } : null}
        expandable={{
          expandRowByClick: true,
          rowExpandable: () => true,
          defaultExpandedRowKeys: expandedRowKeys,
          onExpand: handleOnExpandClick,
          expandedRowKeys,
        }}
      />
    </div>
  );
};

export default ContentListTable;
