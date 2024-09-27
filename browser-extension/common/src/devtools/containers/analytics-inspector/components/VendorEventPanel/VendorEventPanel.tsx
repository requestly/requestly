import React, { useState } from "react";
import { Button, Collapse, Tooltip, Typography } from "antd";
import { CaretRightOutlined, GroupOutlined } from "@ant-design/icons";
import { getCurrentColorScheme } from "src/devtools/utils";
import { Column, ResourceTable } from "@requestly-ui/resource-table";
import { ObjectInspector } from "@devtools-ds/object-inspector";
import { CollapseProps } from "antd/lib";
import { capitalize } from "lodash";
import { VendorEvent } from "@requestly/analytics-vendors";
import "./vendorEventPanel.scss";

enum EVENT_PROPERTIES_TABLE_COLUMN_IDS {
  KEY = "key",
  VALUE = "value",
}

const eventPropertiesTableColumns: Column<Record<string, any>>[] = [
  {
    key: EVENT_PROPERTIES_TABLE_COLUMN_IDS.KEY,
    header: "Key",
    width: 30,
    render: (property) => property.key,
  },
  {
    key: EVENT_PROPERTIES_TABLE_COLUMN_IDS.VALUE,
    header: "Value",
    width: 50,
    render: (property) => (
      <Typography.Text ellipsis={{ tooltip: true }}>{JSON.stringify(property.value)}</Typography.Text>
    ),
  },
];

interface VendorEventPanelProps {
  eventDetails: VendorEvent;
  vendorName: string;
}

export const VendorEventPanel: React.FC<VendorEventPanelProps> = ({ eventDetails, vendorName }) => {
  const [isJsonView, setIsJsonView] = useState(false);

  if (!eventDetails) {
    return <div>No event data found!</div>;
  }

  const nestedCollapseItems: CollapseProps["items"] = Object.entries(eventDetails?.properties ?? {}).map(
    ([key, properties]) => {
      const eventProperties = Object.entries(properties ?? {}).map(([key, value]) => {
        return { key, value };
      });

      return {
        key,
        label: capitalize(key),
        children: (
          <>
            <ResourceTable
              colorScheme={getCurrentColorScheme()}
              resources={eventProperties}
              columns={eventPropertiesTableColumns}
              primaryColumnKeys={[EVENT_PROPERTIES_TABLE_COLUMN_IDS.KEY]}
            />
          </>
        ),
      };
    }
  );

  const collapseItems: CollapseProps["items"] = [
    {
      key: eventDetails.event,
      label: (
        <div className="vendor-event-title">
          <span className="title">{eventDetails.event}</span>

          <div className="actions">
            <Tooltip title={isJsonView ? "View in table" : "View as Json"}>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsJsonView((prev) => !prev);
                }}
                icon={isJsonView ? <GroupOutlined /> : <span>{`{}`}</span>}
              />
            </Tooltip>
          </div>
        </div>
      ),
      children: isJsonView ? (
        <ObjectInspector
          expandLevel={3}
          data={eventDetails.rawEvent}
          includePrototypes={false}
          className="object-inspector vendor-raw-event"
        />
      ) : (
        <Collapse bordered={false} className="nested-event-properties-collapse" items={nestedCollapseItems} />
      ),
    },
  ];

  return (
    <Collapse
      bordered={false}
      items={collapseItems}
      className="vendor-event-panel"
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
    />
  );
};
