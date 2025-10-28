import { ContentListTable, withContentListTableContext } from "componentsV2/ContentList";
import React, { useMemo, useRef } from "react";
import "./ParsedTableView.scss";
import { useVirtualizer } from "@tanstack/react-virtual";

//logic to create iteration column in table
const addIterationColumnToTable = (dataSource: any[]) => {
  return dataSource.map((row, index) => ({
    ...row,
    __iteration: index + 1,
  }));
};

export const PreviewTableView: React.FC<{
  datasource: Record<string, any>[];
}> = ({ datasource }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => addIterationColumnToTable(datasource), [datasource]);

  const columns = useMemo(() => {
    const keys = Object.keys(data[0] || {});
    return [
      {
        title: "Iteration",
        dataIndex: "__iteration",
        key: "__iteration",
        width: 100,
      },
      ...keys
        .filter((k) => k !== "__iteration")
        .map((k) => ({
          title: k,
          dataIndex: k,
          key: k,
          width: 150,
        })),
    ];
  }, [data]);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 33, // Height of each row in pixels
    overscan: 4,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;

  const virtualizedData = useMemo(() => {
    return virtualItems.map((virtualRow) => data[virtualRow.index]);
  }, [virtualItems, data]);

  return (
    <div
      ref={parentRef}
      className="parsed-table-view-container"
      style={{
        height: "100%",
        maxHeight: "334px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          height: totalSize > 0 ? `${totalSize + 35}px` : "auto", // +35px to incorporate the header row
          width: "fit-content",
          minWidth: "100%",
        }}
      >
        <div
          style={{
            transform: `translateY(${paddingTop}px)`,
          }}
        >
          <ContentListTable
            id="parsed-file-preview-table-body"
            data={virtualizedData}
            columns={columns}
            className="parsed-values-table"
            locale={{ emptyText: `No entries found` }}
            scroll={{ x: "max-content" }}
            pagination={false}
            showHeader={paddingTop === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default withContentListTableContext(PreviewTableView);
