import { ContentListTable, withContentListTableContext } from "componentsV2/ContentList";
import React, { useMemo, useRef } from "react";
import "./ParsedTableView.scss";
import { useVirtualizer } from "@tanstack/react-virtual";

//logic to create iteration column in table
const addIterationColumnToTable = (dataSource: any[]) => {
  return dataSource.map((row, index) => ({
    ...row,
    iteration: index + 1,
  }));
};

export const PreviewTableView: React.FC<{
  datasource: Record<string, any>[];
}> = ({ datasource }) => {
  const parentRef = useRef(null);

  const data = addIterationColumnToTable(datasource);
  const limitedData = data.length > 1000 ? data.slice(0, 1000) : data;

  const columns = useMemo(() => {
    const keys = Object.keys(limitedData[0] || {});
    return [
      {
        title: "Iteration",
        dataIndex: "iteration",
        key: "iteration",
      },
      ...keys
        .filter((k) => k !== "iteration")
        .map((k) => ({
          title: k.charAt(0).toUpperCase() + k.slice(1),
          dataIndex: k,
          key: k,
        })),
    ];
  }, [limitedData]);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => data.length,
    overscan: 5,
  });

  //x -> direction should be scrolling till the last columm
  return (
    <div ref={parentRef} className="parsed-table-view-container">
      <ContentListTable
        id="parsed-file-preview-table"
        data={limitedData}
        columns={columns}
        className="parsed-values-table"
        locale={{ emptyText: `No entries found` }}
        scroll={{ x: "max-content" }}
        pagination={false}
      />
    </div>
  );
};

export default withContentListTableContext(PreviewTableView);
