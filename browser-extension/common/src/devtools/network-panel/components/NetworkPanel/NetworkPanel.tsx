import React, { useCallback, useEffect, useState } from "react";
import { NetworkEvent, NetworkFilters } from "../../types";
import NetworkPanelToolbar from "../NetworkPanelToolbar/NetworkPanelToolbar";
import EmptyPanelPlaceholder from "./EmptyPanelPlaceholder";
import NetworkTable from "../NetworkTable/NetworkTable";
import "./networkPanel.scss";

const NetworkPanel: React.FC = () => {
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [filters, setFilters] = useState<NetworkFilters>({});

  useEffect(() => {
    chrome.devtools.network.onRequestFinished.addListener(
      (networkEvent: NetworkEvent) => {
        setNetworkEvents((networkEvents) => [...networkEvents, networkEvent]);
      }
    );
  }, []);

  const clearEvents = useCallback(() => {
    setNetworkEvents([]);
  }, []);

  return networkEvents.length > 0 ? (
    <div className="network-panel">
      <NetworkPanelToolbar
        onFiltersChange={setFilters}
        clearEvents={clearEvents}
      />
      <NetworkTable networkEvents={networkEvents} filters={filters} />
    </div>
  ) : (
    <EmptyPanelPlaceholder />
  );
};

export default NetworkPanel;
