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
import update from "immutability-helper";
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
  dragAndDrop?: boolean;
}

const EXPANDED_ROWS_LOCAL_STORAGE_KEY = "content-list-table-expanded-rows";

let i = 0;

interface DraggableBodyRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

const DRAGGABLE_ELEMENT_TYPE = "DraggableContentListRow";

const DraggableBodyRow = ({ index, moveRow, className, style, ...restProps }: DraggableBodyRowProps) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: DRAGGABLE_ELEMENT_TYPE,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? " drop-over-downward" : " drop-over-upward",
      };
    },
    drop: (item: { index: number }) => {
      moveRow(item.index, index);
    },
  });

  const [, drag] = useDrag({
    type: DRAGGABLE_ELEMENT_TYPE,
    item: { index },
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

const ContentListTable = <DataType extends { [key: string]: any }>({
  id,
  columns,
  data: tableData,
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
}: ContentListTableProps<DataType>): ReactElement => {
  const [data, setData] = useState(tableData);
  const { selectedRows, setSelectedRows } = useContentListTableContext();
  const [expandedRowKeys, setExpandedRowsKeys] = useState<string[]>([]);

  useEffect(() => {
    console.log("table rendering...", ++i);
    setData(tableData);
  }, [tableData]);

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

  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragRow = data[dragIndex];
      setData(
        update(data, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        })
      );
    },
    [data]
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
      {dragAndDrop ? (
        <DndProvider backend={HTML5Backend}>
          <Table
            {...commonProps}
            components={components}
            onRow={(record, index) => {
              onRowCallback(record);

              const attr = {
                index,
                moveRow,
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
