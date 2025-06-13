import React, { useMemo } from "react";
import type { TableProps } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { Collapse } from "antd";
import "./AutoGenTable.scss";

type ColumnTypes = Exclude<TableProps<{ key: string; value: string }>["columns"], undefined>;

interface KeyValueTableProps {
  data: { key: string; value: string }[];
}

export const AutoGenTable: React.FC<KeyValueTableProps> = ({ data }) => {
  const memoizedData = useMemo(() => data, [data]);

  const columns = useMemo(() => {
    return [
      {
        title: "key",
        dataIndex: "key",
        width: "48.5%",
        editable: false,
      },
      {
        title: "value",
        dataIndex: "value",
        editable: false,
      },
      {
        title: "",
        width: "50px",
      },
    ];
  }, []);

  return (
    <div className="auto-gen-table-container">
      <Collapse defaultActiveKey={["1"]} className="collapse-container">
        <Collapse.Panel
          header={<span className="heading-text">Auto-Generated Headers</span>}
          key="1"
          className="custom-collapse-panel"
        >
          <ContentListTable
            id="api-key-value-table"
            className="api-key-value-table"
            bordered
            showHeader={false}
            rowKey="key"
            columns={columns as ColumnTypes}
            data={memoizedData}
            locale={{ emptyText: `No entries found` }}
            scroll={{ x: true }}
          />
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
