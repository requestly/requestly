import React, { useMemo } from "react";
import type { TableProps } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { Collapse } from "antd";
import "./AutoGenTable.scss";
import InfoIcon from "components/misc/InfoIcon";

type ColumnTypes = Exclude<TableProps<{ key: string; value: string }>["columns"], undefined>;

interface KeyValueTableProps {
  data: { key: string; value: string }[];
  type: "queryParams" | "headers";
}

export const AutoGenTable: React.FC<KeyValueTableProps> = ({ data, type }) => {
  const memoizedData = useMemo(() => data, [data]);

  const columns = useMemo(() => {
    return [
      {
        title: "key",
        dataIndex: "key",
        width: "50%",
        editable: false,
      },
      {
        title: "value",
        dataIndex: "value",
        editable: false,
      },
    ];
  }, []);

  return (
    <div className="auto-gen-table-container">
      <Collapse defaultActiveKey={["1"]} className="collapse-container">
        <Collapse.Panel
          header={
            <span className="heading-text">
              {type === "headers" ? "Auto-Generated Headers" : "Auto-Generated Query Parameters"}
              <InfoIcon
                text={
                  type === "headers"
                    ? "These headers are automatically generated and included with each request you send."
                    : "This query param is added based on the selected authorization method. Use the Authorization tab to remove it or change its value."
                }
                showArrow={false}
                tooltipPlacement="right"
                style={{
                  position: "relative",
                  top: "3px",
                  marginLeft: "8px",
                  width: "14px",
                  height: "14px",
                }}
              />
            </span>
          }
          key="1"
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
            footer={null}
          />
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
