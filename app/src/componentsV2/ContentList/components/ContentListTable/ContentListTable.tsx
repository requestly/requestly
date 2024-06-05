import { ReactElement, useCallback, useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Table, TableProps } from "antd";
import { BulkActionBarConfig } from "./types";
import BulkActionBar from "./components/BulkActionBar/BulkActionBar";
import { useContentListTableContext } from "./context";
import { MdOutlineChevronRight } from "@react-icons/all-files/md/MdOutlineChevronRight";
import Logger from "lib/logger";
import "./contentListTable.scss";

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

const EXPANDED_ROWS_LOCAL_STORAGE_KEY = "content-list-table-expanded-rows";

const ContentListTable = <DataType extends { [key: string]: any }>({
  id,
  columns,
  data,
  rowKey = "key",
  loading = false,
  customRowClassName = (record: DataType) => "",
  bulkActionBarConfig,
  size = "middle",
  scroll = { y: "calc(100vh - 232px)" }, // 232px is the height of the content header + top header + footer
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

      const expandedRows = JSON.parse(localStorage.getItem(EXPANDED_ROWS_LOCAL_STORAGE_KEY) || null) ?? {};

      localStorage.setItem(
        EXPANDED_ROWS_LOCAL_STORAGE_KEY,
        JSON.stringify({
          ...expandedRows,
          [id]: Array.from(updatedExpandedRowKeys),
        })
      );
    },
    [expandedRowKeys, id, rowKey]
  );

  useEffect(() => {
    const expandedRowsData = localStorage.getItem(EXPANDED_ROWS_LOCAL_STORAGE_KEY);
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
        rowSelection={
          bulkActionBarConfig
            ? {
                checkStrictly: false,
                selectedRowKeys: selectedRows.map((record) => (record as any)[rowKey]),
                onChange: (selectedRowKeys, selectedRows) => {
                  onRecordSelection(selectedRows);
                  setSelectedRows(selectedRows);
                },
              }
            : null
        }
        expandable={{
          expandRowByClick: true,
          rowExpandable: () => true,
          defaultExpandedRowKeys: expandedRowKeys,
          onExpand: handleOnExpandClick,
          expandedRowKeys,
          expandIcon: ({ expanded, expandable, onExpand, record }) =>
            expandable ? (
              <span
                className="rq-content-list-expand-icon-container"
                onClick={(event) => {
                  event.stopPropagation();
                  onExpand?.(record, event);
                }}
              >
                <MdOutlineChevronRight className={`rq-content-list-expand-icon ${expanded ? "expanded" : ""}`} />
              </span>
            ) : null,
        }}
      />
    </div>
  );
};

export default ContentListTable;
