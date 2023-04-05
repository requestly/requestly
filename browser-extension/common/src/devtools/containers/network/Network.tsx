import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  NetworkEvent,
  NetworkFilters,
  NetworkSettings,
  ResourceTypeFilter,
} from "../../types";
import { PrimaryToolbar, FiltersToolbar } from "./NetworkToolbars";
import EmptyPanelPlaceholder from "../../components/EmptyPanelPlaceholder/EmptyPanelPlaceholder";
import NetworkTable from "./NetworkTable/NetworkTable";
import "./network.scss";

const Network: React.FC = () => {
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [filters, setFilters] = useState<NetworkFilters>({
    url: "",
    resourceType: ResourceTypeFilter.ALL,
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
  }, []);

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
        <EmptyPanelPlaceholder />
      )}
    </div>
  );
};

export default Network;
