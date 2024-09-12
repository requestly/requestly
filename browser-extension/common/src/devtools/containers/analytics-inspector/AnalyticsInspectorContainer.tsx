import React, { useCallback, useEffect, useRef, useState } from "react";
import { NetworkEvent, NetworkSettings } from "../../types";
import EmptyContainerPlaceholder from "../../components/EmptyContainerPlaceholder/EmptyContainerPlaceholder";
import { Collapse } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
// @ts-ignore
import getAnalyticsVendorsRegistry from "@requestly/analytics-vendors";
import { VendorEvent } from "./components/VendorEvent/VendorEvent";
import "./analyticsInspectorContainer.scss";

const AnalyticsInspectorContainer: React.FC = () => {
  // @ts-ignore
  const analyticsVendorsRegistry = getAnalyticsVendorsRegistry();

  const [vendorEvents, setVendorEvents] = useState<Record<string, NetworkEvent[]>>({});

  const [settings, setSettings] = useState<NetworkSettings>({
    preserveLog: false,
  });
  const preserveLogRef = useRef(false);

  const clearEvents = useCallback(() => {
    setVendorEvents({});
  }, []);

  useEffect(() => {
    chrome.devtools.network.onRequestFinished.addListener((networkEvent: NetworkEvent) => {
      const vendor = analyticsVendorsRegistry.getInstance().getVendorByUrl(networkEvent.request.url);

      // If there is no matching vendor for this network request, do nothing.
      if (!vendor) return;

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

    <div className="analytics-inspector-container">
      {Object.keys(vendorEvents).length === 0 ? (
        <EmptyContainerPlaceholder
          lines={[
            "Recording Analytics events...(Only BlueCore event supported, More vendors will be added soon)",
            "Perform an action that triggers event.",
          ]}
        />
      ) : (
        <div>
          {Object.keys(vendorEvents).map((vendor) => {
            return (
              <Collapse
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
