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

interface DraggableBodyRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  recordId: string;
  onRowDrop: (sourceRecordId: string, targetRecordId: string) => void;
}

const DRAGGABLE_ELEMENT_TYPE = "DraggableContentListRow";

const DraggableBodyRow = ({ index, onRowDrop, className, style, recordId, ...restProps }: DraggableBodyRowProps) => {
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

    drop: (sourceItem: { index: number; recordId: string }) => {
      onRowDrop(sourceItem.recordId, recordId);
    },
  });

  const [, drag] = useDrag({
    type: DRAGGABLE_ELEMENT_TYPE,
    item: { index, recordId },
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
  onRowDropped?: (sourceRecordId: string, targetRecordId: string, expandRow: (id: string) => void) => void;
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
}: ContentListTableProps<DataType>): ReactElement => {
  const { selectedRows, setSelectedRows } = useContentListTableContext();
  const [expandedRowKeys, setExpandedRowsKeys] = useState<string[]>([]);
  const isDragAndDropEnabled = useFeatureIsOn("content_table_drag_and_drop_support");

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

  const components = {
    body: {
      row: DraggableBodyRow,
    },
  };

  const expandRow = useCallback(
    (id: string) => {
      let updatedExpandedRowKeys = new Set(expandedRowKeys);
      updatedExpandedRowKeys = updatedExpandedRowKeys.add(id);
      setExpandedRowsKeys(Array.from(updatedExpandedRowKeys));
    },
    [expandedRowKeys]
  );

  const onRowDrop = useCallback(
    (sourceRecordId: string, targetRecordId: string) => {
      onRowDropped(sourceRecordId, targetRecordId, expandRow);
    },
    [onRowDropped, expandRow]
  );

  const commonProps: TableProps<DataType> = {
    className: `rq-content-list-table ${className}`,
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
    rowSelection: bulkActionBarConfig
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
  };

  return (
    <div className="rq-content-list-table-container">
      {bulkActionBarConfig && <BulkActionBar config={bulkActionBarConfig} selectedRows={selectedRows} />}
      {isDragAndDropEnabled && dragAndDrop ? (
        <DndProvider backend={HTML5Backend}>
          <Table
            {...commonProps}
            components={components}
            onRow={(record, index) => {
              const onRowAttr = onRowCallback(record);

              const attr = {
                index,
                onRowDrop,
                recordId: record.id,
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
