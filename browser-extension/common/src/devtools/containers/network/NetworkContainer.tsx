import React, { useCallback, useEffect, useRef, useState } from "react";
import { NetworkEvent, ResourceFilters, NetworkSettings, RQNetworkEvent } from "../../types";
import { PrimaryToolbar, FiltersToolbar } from "./toolbars";
import EmptyContainerPlaceholder from "../../components/EmptyContainerPlaceholder/EmptyContainerPlaceholder";
import { ResourceTypeFilterValue } from "../../components/ResourceTypeFilter";
import { ResourceTable } from "@requestly-ui/resource-table";
import networkEventTableColumns, { NETWORK_TABLE_COLUMN_IDS } from "./columns";
import networkEventDetailsTabs from "./details-tabs";
import { enrichNetworkEvent, getCurrentColorScheme, matchResourceTypeFilter } from "../../utils";
import "./networkContainer.scss";
import { getGraphQLDetails } from "./networkLogUtils";

const NetworkContainer: React.FC = () => {
  const [networkEvents, setNetworkEvents] = useState<RQNetworkEvent[]>([]);
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
      enrichNetworkEvent(networkEvent);
      const rqNetworkEvent: RQNetworkEvent = {
        ...networkEvent,
        getContent: networkEvent.getContent,
        metadata: {
          graphQLDetails: getGraphQLDetails(networkEvent),
        },
      };

      setNetworkEvents((prev) => [...prev, rqNetworkEvent]);
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
    (networkEvent: RQNetworkEvent): boolean => {
      // TODO: filters.url filters by url and postData text. Not modifying the variable name for now.
      if (filters.url) {
        const url = networkEvent.request.url.toLowerCase();
        const postDataText = networkEvent.request.postData?.text?.toLowerCase();
        if (!(url.includes(filters.url.toLowerCase()) || postDataText?.includes(filters.url.toLowerCase()))) {
          return false;
        }
      }

      if (filters.resourceType && !matchResourceTypeFilter(networkEvent._resourceType, filters.resourceType)) {
        return false;
      }

      return true;
    },
    [filters]
  );

  const checkEventFailed = useCallback((networkEvent: RQNetworkEvent) => {
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
            colorScheme={getCurrentColorScheme()}
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
