import React, { useCallback, useEffect, useRef, useState } from "react";
import { NetworkEvent, ResourceFilters, NetworkSettings } from "../../types";
import { PrimaryToolbar, FiltersToolbar } from "./toolbars";
import EmptyContainerPlaceholder from "../../components/EmptyContainerPlaceholder/EmptyContainerPlaceholder";
import { ResourceTypeFilterValue } from "../../components/ResourceTypeFilter";
import NetworkTable from "./NetworkTable/NetworkTable";
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
    chrome.devtools.network.onRequestFinished.addListener(
      (networkEvent: NetworkEvent) => {
        setNetworkEvents((networkEvents) => [...networkEvents, networkEvent]);
      }
    );

    chrome.devtools.network.onNavigated.addListener(() => {
      if (!preserveLogRef.current) {
        clearEvents();
      }
    });
  }, [clearEvents]);

  useEffect(() => {
    preserveLogRef.current = settings.preserveLog;
  }, [settings]);

  return (
    <div className="network-container">
      <PrimaryToolbar
        clearEvents={clearEvents}
        settings={settings}
        onSettingsChange={setSettings}
      />
      {networkEvents.length > 0 ? (
        <>
          <FiltersToolbar filters={filters} onFiltersChange={setFilters} />
          <NetworkTable networkEvents={networkEvents} filters={filters} />
        </>
      ) : (
        <EmptyContainerPlaceholder
          lines={[
            "Recording network activity...",
            "Perform a request or Reload the page to see network requests.",
          ]}
        />
      )}
    </div>
  );
};

export default NetworkContainer;
