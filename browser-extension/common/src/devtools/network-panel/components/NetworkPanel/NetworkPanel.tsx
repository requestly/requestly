import React, { useCallback, useEffect, useState } from "react";
import { NetworkEvent, NetworkFilters } from "../../types";
import { PrimaryToolbar, FiltersToolbar } from "../NetworkPanelToolbar";
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

  return (
    <div className="network-panel">
      <PrimaryToolbar clearEvents={clearEvents} />
      {networkEvents.length > 0 ? (
        <>
          <FiltersToolbar onFiltersChange={setFilters} />
          <NetworkTable networkEvents={networkEvents} filters={filters} />
        </>
      ) : (
        <EmptyPanelPlaceholder />
      )}
    </div>
  );
};

export default NetworkPanel;
