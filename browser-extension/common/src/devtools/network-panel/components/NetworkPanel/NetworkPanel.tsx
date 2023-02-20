import React, { useEffect, useState } from "react";
import { NetworkEvent, NetworkFilters } from "../../types";
import NetworkEventFilters from "../NetworkEventFilters/NetworkEventFilters";
import EmptyPanelPlaceholder from "./EmptyPanelPlaceholder";
import NetworkTable from "../NetworkTable/NetworkTable";
import "./networkPanel.scss";
import { StopOutlined } from "@ant-design/icons";
import IconButton from "../IconButton/IconButton";

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

  return networkEvents.length > 0 ? (
    <div className="network-panel">
      <div className="network-panel-toolbar">
        <IconButton
          icon={StopOutlined}
          className="clear-events-button"
          onClick={() => setNetworkEvents([])}
          tooltip="Clear"
        />
        <NetworkEventFilters onChange={setFilters} />
      </div>
      <NetworkTable networkEvents={networkEvents} filters={filters} />
    </div>
  ) : (
    <EmptyPanelPlaceholder />
  );
};

export default NetworkPanel;
