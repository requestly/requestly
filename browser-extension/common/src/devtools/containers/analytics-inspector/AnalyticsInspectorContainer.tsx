import React, { useCallback, useEffect, useRef, useState } from "react";
import { ExecutionEvent, NetworkSettings, ExecutionFilters } from "../../types";
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

  // const [executionEvents, setExecutionEvents] = useState<ExecutionEvent[]>([]);
  // const [filters, setFilters] = useState<ExecutionFilters>({
  //   url: "",
  //   resourceType: ResourceTypeFilterValue.ALL,
  //   ruleName: "",
  // });
  // const [settings, setSettings] = useState<NetworkSettings>({
  //   preserveLog: false,
  // });
  // const preserveLogRef = useRef(false);

  // const clearEvents = useCallback(() => {
  //   setExecutionEvents([]);
  // }, []);

  // useEffect(() => {
  //   preserveLogRef.current = settings.preserveLog;
  // }, [settings]);

  // useEffect(() => {
  //   const bgPortConnection = chrome.runtime.connect({ name: "rq_devtools" });

  //   // Send a heartbeat message to the background script every 15 seconds to keep the connection alive
  //   setInterval(() => {
  //     bgPortConnection.postMessage("heartbeat");
  //   }, 15000);

  //   bgPortConnection.onMessage.addListener((executionEvent: ExecutionEvent) => {
  //     setExecutionEvents((executionEvents) => [
  //       ...executionEvents,
  //       {
  //         ...executionEvent,
  //         _resourceType: getResourceType(executionEvent.requestType),
  //       },
  //     ]);
  //   });

  //   chrome.devtools.network.onNavigated.addListener(() => {
  //     if (!preserveLogRef.current) {
  //       clearEvents();
  //     }
  //   });

  //   bgPortConnection.postMessage({
  //     action: "registerDevTool",
  //     tabId: chrome.devtools.inspectedWindow.tabId,
  //   });
  // }, [clearEvents]);

  // const filterExecutions = useCallback(
  //   (execution: ExecutionEvent): boolean => {
  //     if (filters.url && !execution.requestURL.toLowerCase().includes(filters.url.toLowerCase())) {
  //       return false;
  //     }

  //     if (filters.resourceType && !matchResourceTypeFilter(execution._resourceType, filters.resourceType)) {
  //       return false;
  //     }

  //     if (filters.ruleName && !execution.rule.name.toLowerCase().includes(filters.ruleName.toLowerCase())) {
  //       return false;
  //     }

  //     return true;
  //   },
  //   [filters]
  // );

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
        <span>{analyticsVendorsRegistry.getInstance().getVendorByUrl("api.bluecore.com/api/track/123").name}</span>
      </div>
    </div>
  );
};

export default AnalyticsInspectorContainer;
