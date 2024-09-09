import React, { useCallback, useEffect, useRef, useState } from "react";
import { NetworkEvent, NetworkSettings } from "../../types";
// import { PrimaryToolbar, FiltersToolbar } from "./toolbars";
import EmptyContainerPlaceholder from "../../components/EmptyContainerPlaceholder/EmptyContainerPlaceholder";
import { ResourceTable } from "@requestly-ui/resource-table";
import { ResourceTypeFilterValue } from "../../components/ResourceTypeFilter";
//import executionTableColumns, { EXECUTION_TABLE_COLUMN_IDS } from "./columns";
//import executionDetailsTabs from "./details-tabs";
// import { getResourceType } from "./utils";
import { getCurrentColorScheme, matchResourceTypeFilter } from "../../utils";
// import "./executionsContainer.scss";

import getAnalyticsVendorsRegistry from "@requestly/analytics-vendors";

const AnalyticsInspectorContainer: React.FC = () => {
  const analyticsVendorsRegistry = getAnalyticsVendorsRegistry();

  const [vendorEvents, setVendorEvents] = useState<Map<string, NetworkEvent[]>>(new Map());

  const [settings, setSettings] = useState<NetworkSettings>({
    preserveLog: false,
  });
  const preserveLogRef = useRef(false);

  const clearEvents = useCallback(() => {
    setVendorEvents(new Map());
  }, []);

  useEffect(() => {
    chrome.devtools.network.onRequestFinished.addListener((networkEvent: NetworkEvent) => {
      const vendor = analyticsVendorsRegistry.getInstance().getVendorByUrl(networkEvent.request.url);

      // If there is no matching vendor for this network request, do nothing.
      if (!vendor) return;

      setVendorEvents((prev) => {
        const existingEvents = prev.get(vendor.name) || [];
        return new Map(prev).set(vendor.name, [...existingEvents, networkEvent]);
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
      <EmptyContainerPlaceholder
        lines={[
          "Recording Analytics events...(Only BlueCore event supported, More vendors will be added soon)",
          "Perform an action that triggers event.",
        ]}
      />

      <div className="analytics-inspector-container">
        <span>
          {analyticsVendorsRegistry.getInstance().getVendorByUrl("api.bluecore.com/api/track/123").name}+ '-' +
          {vendorEvents.get("BlueCore")?.length}
        </span>
      </div>
    </div>
  );
};

export default AnalyticsInspectorContainer;
