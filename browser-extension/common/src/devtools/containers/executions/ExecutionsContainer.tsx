import React, { useCallback, useEffect, useRef, useState } from "react";
import { ExecutionEvent, ResourceFilters, NetworkSettings } from "../../types";
import { PrimaryToolbar, FiltersToolbar } from "./toolbars";
import EmptyContainerPlaceholder from "../../components/EmptyContainerPlaceholder/EmptyContainerPlaceholder";
import "./executionsContainer.scss";
import { ResourceTable } from "../../components/ResourceTable";
import { ResourceTypeFilterValue } from "../../components/ResourceTypeFilter";
import executionTableColumns, { EXECUTION_TABLE_COLUMN_IDS } from "./columns";
import executionDetailsTabs from "./details";
import { getResourceType } from "./utils";
import { matchResourceTypeFilter } from "../../utils";

const ExecutionsContainer: React.FC = () => {
  const [executionEvents, setExecutionEvents] = useState<ExecutionEvent[]>([]);
  const [filters, setFilters] = useState<ResourceFilters>({
    url: "",
    resourceType: ResourceTypeFilterValue.ALL,
  });
  const [settings, setSettings] = useState<NetworkSettings>({
    preserveLog: false,
  });
  const preserveLogRef = useRef(false);

  const clearEvents = useCallback(() => {
    setExecutionEvents([]);
  }, []);

  useEffect(() => {
    preserveLogRef.current = settings.preserveLog;
  }, [settings]);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: "rq_devtools" });

    port.onMessage.addListener((executionEvent: ExecutionEvent) => {
      setExecutionEvents((executionEvents) => [
        ...executionEvents,
        {
          ...executionEvent,
          _resourceType: getResourceType(executionEvent.requestType),
        },
      ]);
    });

    chrome.devtools.network.onNavigated.addListener(() => {
      if (!preserveLogRef.current) {
        clearEvents();
      }
    });

    port.postMessage({
      action: "registerDevTool",
      tabId: chrome.devtools.inspectedWindow.tabId,
    });
  }, [clearEvents]);

  const filterExecutions = useCallback(
    (execution: ExecutionEvent): boolean => {
      if (
        filters.url &&
        !execution.requestURL.toLowerCase().includes(filters.url.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.resourceType &&
        !matchResourceTypeFilter(execution._resourceType, filters.resourceType)
      ) {
        return false;
      }

      return true;
    },
    [filters]
  );

  return (
    <div className="executions-container">
      <PrimaryToolbar
        clearEvents={clearEvents}
        settings={settings}
        onSettingsChange={setSettings}
      />
      {executionEvents.length > 0 ? (
        <>
          <FiltersToolbar filters={filters} onFiltersChange={setFilters} />
          <ResourceTable
            resources={executionEvents}
            columns={executionTableColumns}
            primaryColumnKeys={[EXECUTION_TABLE_COLUMN_IDS.URL]}
            detailsTabs={executionDetailsTabs}
            filter={filterExecutions}
          />
        </>
      ) : (
        <EmptyContainerPlaceholder
          lines={[
            "Recording rule executions...",
            "Perform a request or Reload the page to see network requests intercepted and modified by Requestly.",
          ]}
        />
      )}
    </div>
  );
};

export default ExecutionsContainer;
