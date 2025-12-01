import React, { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Table, TableProps } from "antd";
import { BulkActionBarConfig } from "./types";
import BulkActionBar from "./components/BulkActionBar/BulkActionBar";
import { useContentListTableContext } from "./context";
import { MdOutlineChevronRight } from "@react-icons/all-files/md/MdOutlineChevronRight";
import Logger from "lib/logger";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import "./contentListTable.scss";

interface DraggableBodyRowProps<DataType> extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  recordId: string;
  record: DataType;
  onRowDrop: (sourceRecord: DataType, targetRecord: DataType) => void;
}

const DRAGGABLE_ELEMENT_TYPE = "DraggableContentListRow";

const DraggableBodyRow = <DataType extends { [key: string]: any }>({
  index,
  onRowDrop,
  className,
  style,
  recordId,
  record,
  ...restProps
}: DraggableBodyRowProps<DataType>) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: DRAGGABLE_ELEMENT_TYPE,

    collect: (monitor) => {
      const { recordId: dragRecordId } =
        monitor.getItem<{
          index: number;
          recordId: string;
        }>() || {};

      if (recordId === dragRecordId) {
        return {};
      }

      return {
        isOver: monitor.isOver(),
        dropClassName: " rq-dnd-target-row",
      };
    },

    drop: (sourceItem: { index: number; recordId: string; record: DataType }) => {
      onRowDrop(sourceItem.record, record);
    },
  });

  const [, drag] = useDrag({
    type: DRAGGABLE_ELEMENT_TYPE,
    item: { index, recordId, record },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drop(drag(ref));

  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ""}`}
      style={{ cursor: "move", ...style }}
      {...restProps}
    />
  );
};

const EXPANDED_ROWS_LOCAL_STORAGE_KEY = "content-list-table-expanded-rows";

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
  dragAndDrop?: boolean;
  onRowDropped?: (sourceRecordId: string, targetRecordId: string) => void;
  defaultExpandedRowKeys?: string[];
  isRowSelectable?: boolean;
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
  scroll = { y: "calc(100vh - 232px)" }, // 232px is the height of the content header + top header + footer
  locale,
  onRecordSelection = () => {},
  className = "",
  onRow: onRowCallback = (record: DataType) => ({}),
  dragAndDrop = false,
  onRowDropped = () => {},
  defaultExpandedRowKeys = [],
  components,
  footer,
  bordered = false,
  showHeader = true,
  isRowSelectable = true,
}: ContentListTableProps<DataType>): ReactElement => {
  const { selectedRows, setSelectedRows } = useContentListTableContext();
  const [expandedRowKeys, setExpandedRowsKeys] = useState<string[]>([]);
  const isDragAndDropEnabled = useFeatureIsOn("content_table_drag_and_drop_support");

  useEffect(() => {
    if (defaultExpandedRowKeys.length > 0) {
      setExpandedRowsKeys(defaultExpandedRowKeys);
    }
  }, [defaultExpandedRowKeys]);

  const expandRow = useCallback(
    (expanded: boolean, record: DataType) => {
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

  const handleOnExpandClick = useCallback(
    (expanded: boolean, record: DataType) => {
      Logger.log("handleOnExpandClick", expanded, record);
      expandRow(expanded, record);
    },
    [expandRow]
  );

  useEffect(() => {
    const expandedRowsData = localStorage.getItem(EXPANDED_ROWS_LOCAL_STORAGE_KEY);
    const currentListTableExpandedRows = expandedRowsData ? JSON.parse(expandedRowsData)[id] : [];
    if (currentListTableExpandedRows) {
      setExpandedRowsKeys(currentListTableExpandedRows);
    }
  }, [id]);

  const onRowDrop = useCallback(
    (sourceRecord: DataType, targetRecord: DataType) => {
      onRowDropped(sourceRecord?.[rowKey], targetRecord?.[rowKey]);
      if (targetRecord?.children) {
        expandRow(true, targetRecord);
      }
    },
    [onRowDropped, rowKey, expandRow]
  );

  const commonProps: TableProps<DataType> = {
    className: `rq-content-list-table ${className} ${isRowSelectable ? "rq-content-list-table-selectable" : ""}`,
    onHeaderRow: () => ({
      className: "rq-content-list-table-header",
    }),
    rowClassName: (record: DataType) => `rq-content-list-table-row ${customRowClassName?.(record)}`,
    size: size,
    loading: loading,
    rowKey: rowKey,
    columns: columns,
    dataSource: data,
    pagination: false,
    scroll: scroll,
    locale: locale,
    rowSelection:
      isRowSelectable && bulkActionBarConfig
        ? {
            checkStrictly: false,
            selectedRowKeys: selectedRows.map((record) => (record as any)[rowKey]),
            onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
              onRecordSelection(selectedRows);
              setSelectedRows(selectedRows);
            },
          }
        : null,
    expandable: {
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
    },
    components: components,
    footer: footer,
    bordered: bordered,
    showHeader,
  };

  return (
    <div className="rq-content-list-table-container">
      {bulkActionBarConfig && <BulkActionBar config={bulkActionBarConfig} selectedRows={selectedRows} />}
      {isDragAndDropEnabled && dragAndDrop ? (
        <DndProvider backend={HTML5Backend} context={window}>
          <Table
            {...commonProps}
            components={{
              body: {
                row: DraggableBodyRow,
              },
            }}
            onRow={(record, index) => {
              const onRowAttr = onRowCallback(record);

              const attr = {
                index,
                onRowDrop,
                recordId: record[rowKey],
                record: record,
                ...onRowAttr,
              };

              return attr as React.HTMLAttributes<any>;
            }}
          />
        </DndProvider>
      ) : (
        <Table {...commonProps} onRow={onRowCallback} />
      )}
    </div>
  );
};

export default ContentListTable;
