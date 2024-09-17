import React from "react";
import { Collapse, Typography } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { getCurrentColorScheme } from "src/devtools/utils";
import { Column, ResourceTable } from "@requestly-ui/resource-table";

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

export const VendorEvent: React.FC<{ eventDetails: Record<string, any>; vendorName: string }> = ({
  eventDetails,
  vendorName,
}) => {
  console.log(`${vendorName} - eventDetails`, eventDetails);

  if (!eventDetails) {
    return <div>No event data found!</div>;
  }

  const eventProperties = Object.entries(eventDetails?.properties ?? {}).map(([key, value]) => {
    return { key, value };
  });

  return (
    <Collapse
      bordered={false}
      className="vendor-event-collapse"
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
    >
      <Collapse.Panel
        key={eventDetails.url}
        header={<Typography.Text ellipsis={{ tooltip: true }}>{eventDetails.event}</Typography.Text>}
      >
        <ResourceTable
          colorScheme={getCurrentColorScheme()}
          resources={eventProperties}
          columns={eventPropertiesTableColumns}
          primaryColumnKeys={[EVENT_PROPERTIES_TABLE_COLUMN_IDS.KEY]}
        />
      </Collapse.Panel>
    </Collapse>
  );
};
