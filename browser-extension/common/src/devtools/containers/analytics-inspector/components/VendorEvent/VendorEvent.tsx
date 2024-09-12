import React from "react";
import { Collapse, Typography } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import { NetworkEvent } from "src/devtools/types";
import { getCurrentColorScheme, getDecodedBase64Data } from "src/devtools/utils";
import { Column, ResourceTable } from "@requestly-ui/resource-table";

const getBlurCoreEventDetails = (event: NetworkEvent) => {
  const postData = event.request.postData;

  if (!postData) {
    return null;
  }

  if (!postData.mimeType.includes("urlencoded")) {
    return null;
  }

  const eventDetails = getDecodedBase64Data("data", postData.text);
  return eventDetails as Record<string, any>;
};

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

export const VendorEvent: React.FC<{ event: NetworkEvent }> = ({ event }) => {
  const eventDetails = getBlurCoreEventDetails(event);

  if (!eventDetails) {
    return <div>No event data found!</div>;
  }

  const eventProperties = Object.entries(eventDetails.properties).map(([key, value]) => {
    return { key, value };
  });

  return (
    <Collapse
      bordered={false}
      className="vendor-event-collapse"
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
    >
      <Collapse.Panel
        key={event.request.url}
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
