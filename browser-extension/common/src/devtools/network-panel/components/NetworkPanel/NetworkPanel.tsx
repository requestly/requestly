import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  NetworkEvent,
  NetworkFilters,
  NetworkPanelSettings,
  ResourceTypeFilter,
} from "../../types";
import { PrimaryToolbar, FiltersToolbar } from "../NetworkPanelToolbar";
import EmptyPanelPlaceholder from "./EmptyPanelPlaceholder";
import NetworkTable from "../NetworkTable/NetworkTable";
import "./networkPanel.scss";

const NetworkPanel: React.FC = () => {
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [filters, setFilters] = useState<NetworkFilters>({
    url: "",
    resourceType: ResourceTypeFilter.ALL,
  });
  const [settings, setSettings] = useState<NetworkPanelSettings>({
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
    <div className="network-panel">
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

export default NetworkPanel;
