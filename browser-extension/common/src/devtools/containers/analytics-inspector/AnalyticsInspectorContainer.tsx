import React, { useCallback, useEffect, useRef, useState } from "react";
import { NetworkEvent, NetworkSettings } from "../../types";
// import { PrimaryToolbar, FiltersToolbar } from "./toolbars";
import EmptyContainerPlaceholder from "../../components/EmptyContainerPlaceholder/EmptyContainerPlaceholder";
import { ResourceTable } from "@requestly-ui/resource-table";
import { ResourceTypeFilterValue } from "../../components/ResourceTypeFilter";
//import executionTableColumns, { EXECUTION_TABLE_COLUMN_IDS } from "./columns";
//import executionDetailsTabs from "./details-tabs";
// import { getResourceType } from "./utils";
import { getCurrentColorScheme, getDecodedBase64Data, matchResourceTypeFilter } from "../../utils";
import "./analyticsInspectorContainer.scss";

import getAnalyticsVendorsRegistry from "@requestly/analytics-vendors";
import { Collapse, Typography } from "antd";
import { Table } from "@devtools-ds/table";
import { CaretRightOutlined } from "@ant-design/icons";

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

const VendorEvent: React.FC<{ event: NetworkEvent }> = ({ event }) => {
  const eventDetails = getBlurCoreEventDetails(event);

  if (!eventDetails) {
    return <div>No event data found!</div>;
  }

  return (
    <Collapse
      bordered={false}
      className="vendor-event-collapse"
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
    >
      <Collapse.Panel key={event.request.url} header={<Typography.Text ellipsis={{ tooltip: true }}>{eventDetails.event}</Typogr>}>
        <div style={{ overflowY: "auto", height: "100%", padding: "0.8rem" }}>
          <Table className="payload-table">
            <Table.Head>
              <Table.Row>
                <Table.HeadCell>Key</Table.HeadCell>
                <Table.HeadCell>Value</Table.HeadCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {Object.entries(eventDetails.properties).map(([key, value], i) => {
                return (
                  <Table.Row key={i}>
                    <Table.Cell>
                      <Typography.Text ellipsis={{ tooltip: true }}>{key}</Typography.Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Typography.Text ellipsis={{ tooltip: true }}>{JSON.stringify(value)}</Typography.Text>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      </Collapse.Panel>
    </Collapse>
  );
};

const AnalyticsInspectorContainer: React.FC = () => {
  const analyticsVendorsRegistry = getAnalyticsVendorsRegistry();

  const [vendorEvents, setVendorEvents] = useState<Record<string, NetworkEvent[]>>({});

  const [settings, setSettings] = useState<NetworkSettings>({
    preserveLog: false,
  });
  const preserveLogRef = useRef(false);

  console.log("vendorEvents", vendorEvents);

  const clearEvents = useCallback(() => {
    setVendorEvents({});
  }, []);

  useEffect(() => {
    chrome.devtools.network.onRequestFinished.addListener((networkEvent: NetworkEvent) => {
      const vendor = analyticsVendorsRegistry.getInstance().getVendorByUrl(networkEvent.request.url);

      // If there is no matching vendor for this network request, do nothing.
      if (!vendor) return;

      console.log(`${vendor.name} - event:`, networkEvent);

      setVendorEvents((prev) => {
        const existingEvents = prev[vendor.name] || [];

        if (vendor.name === "BlueCore" && networkEvent.request.method === "POST") {
          return { ...prev, [vendor.name]: [...existingEvents, networkEvent] };
        }

        return prev;
      });
    });

    chrome.devtools.network.onNavigated.addListener(() => {
      if (!preserveLogRef.current) {
        //clearEvents();
      }
    });
  }, [clearEvents]);

  useEffect(() => {
    preserveLogRef.current = settings.preserveLog;
  }, [settings]);

  return (
    // <div className="executions-container">
    //   <PrimaryToolbar clearEvents={clearEvents} settings={settings} onSettingsChange={setSettings} />
    //   {executionEvents.length > 0 ? (
    //     <>
    //       <FiltersToolbar filters={filters} onFiltersChange={setFilters} />
    //       <ResourceTable
    //         colorScheme={getCurrentColorScheme()}
    //         resources={executionEvents}
    //         columns={executionTableColumns}
    //         primaryColumnKeys={[EXECUTION_TABLE_COLUMN_IDS.URL]}
    //         detailsTabs={executionDetailsTabs}
    //         filter={filterExecutions}
    //       />
    //     </>
    //   ) : (
    //     <EmptyContainerPlaceholder
    //       lines={[
    //         "Recording rule executions...",
    //         "Perform a request or Reload the page to see network requests intercepted and modified by Requestly.",
    //       ]}
    //     />
    //   )}
    // </div>

    <div>
      {Object.keys(vendorEvents).length === 0 ? (
        <EmptyContainerPlaceholder
          lines={[
            "Recording Analytics events...(Only BlueCore event supported, More vendors will be added soon)",
            "Perform an action that triggers event.",
          ]}
        />
      ) : (
        <div className="analytics-inspector-container">
          {Object.keys(vendorEvents).map((vendor) => {
            return (
              <Collapse
                bordered={false}
                className="vendor-event-details"
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              >
                <Collapse.Panel key={vendor} header={vendor}>
                  {vendorEvents[vendor].map((event) => {
                    return <VendorEvent event={event} />;
                  })}
                </Collapse.Panel>
              </Collapse>
            );
          })}

          {/* <span>
            {analyticsVendorsRegistry.getInstance().getVendorByUrl("api.bluecore.app/api/track/123").name}+ '-' +
            {vendorEvents["BlueCore"]?.length}
          </span> */}
        </div>
      )}
    </div>
  );
};

export default AnalyticsInspectorContainer;
