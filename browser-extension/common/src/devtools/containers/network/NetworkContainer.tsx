import React, { useCallback, useEffect, useRef, useState } from "react";
import { NetworkEvent, ResourceFilters, NetworkSettings } from "../../types";
import { PrimaryToolbar, FiltersToolbar } from "./toolbars";
import EmptyContainerPlaceholder from "../../components/EmptyContainerPlaceholder/EmptyContainerPlaceholder";
import { ResourceTypeFilterValue } from "../../components/ResourceTypeFilter";
import { ResourceTable } from "../../components/ResourceTable";
import networkEventTableColumns, { NETWORK_TABLE_COLUMN_IDS } from "./columns";
import networkEventDetailsTabs from "./details-tabs";
import { matchResourceTypeFilter } from "../../utils";
import "./networkContainer.scss";

const NetworkContainer: React.FC = () => {
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [filters, setFilters] = useState<ResourceFilters>({
    url: "",
    resourceType: ResourceTypeFilterValue.ALL,
  });
  const [settings, setSettings] = useState<NetworkSettings>({
    preserveLog: false,
  });
  const preserveLogRef = useRef(false);

  const clearEvents = useCallback(() => {
    setNetworkEvents([]);
  }, []);

  useEffect(() => {
    chrome.devtools.network.onRequestFinished.addListener((networkEvent: NetworkEvent) => {
      setNetworkEvents((networkEvents) => [...networkEvents, networkEvent]);
    });

    chrome.devtools.network.onNavigated.addListener(() => {
      if (!preserveLogRef.current) {
        clearEvents();
      }
    });
  }, [clearEvents]);

  useEffect(() => {
    preserveLogRef.current = settings.preserveLog;
  }, [settings]);

  const filterNetworkEvents = useCallback(
    (networkEvent: NetworkEvent): boolean => {
      if (filters.url && !networkEvent.request.url.toLowerCase().includes(filters.url.toLowerCase())) {
        return false;
      }

      if (filters.resourceType && !matchResourceTypeFilter(networkEvent._resourceType, filters.resourceType)) {
        return false;
      }

      return true;
    },
    [filters]
  );

  const checkEventFailed = useCallback((networkEvent: NetworkEvent) => {
    const status = networkEvent.response.status;
    return !status || (status >= 400 && status <= 599);
  }, []);

  return (
    <div className="network-container">
      <PrimaryToolbar clearEvents={clearEvents} settings={settings} onSettingsChange={setSettings} />
      {networkEvents.length > 0 ? (
        <>
          <FiltersToolbar filters={filters} onFiltersChange={setFilters} />
          <ResourceTable
            resources={networkEvents}
            columns={networkEventTableColumns}
            primaryColumnKeys={[NETWORK_TABLE_COLUMN_IDS.URL]}
            detailsTabs={networkEventDetailsTabs}
            filter={filterNetworkEvents}
            isFailed={checkEventFailed}
          />
        </>
      ) : (
        <EmptyContainerPlaceholder
          lines={["Recording network activity...", "Perform a request or Reload the page to see network requests."]}
        />
      )}
    </div>
  );
};

export default NetworkContainer;
