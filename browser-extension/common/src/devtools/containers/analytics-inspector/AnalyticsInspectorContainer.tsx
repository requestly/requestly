import React, { useCallback, useEffect, useRef, useState } from "react";
import { NetworkEvent, NetworkSettings } from "../../types";
import EmptyContainerPlaceholder from "../../components/EmptyContainerPlaceholder/EmptyContainerPlaceholder";
import { Collapse } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import getAnalyticsVendorsRegistry from "@requestly/analytics-vendors";
import { VendorEventPanel } from "./components/VendorEventPanel/VendorEventPanel";
import { PrimaryToolbar } from "./toolbars";
import "./analyticsInspectorContainer.scss";

const AnalyticsInspectorContainer: React.FC = () => {
  const analyticsVendorsRegistry = getAnalyticsVendorsRegistry();

  const [vendorEvents, setVendorEvents] = useState<Record<string, NetworkEvent[]>>({});
  const [settings, setSettings] = useState<NetworkSettings>({
    preserveLog: false,
  });

  const preserveLogRef = useRef(false);

  const clearEvents = useCallback(() => {
    setVendorEvents({});
  }, []);

  useEffect(() => {
    chrome.devtools.network.onRequestFinished.addListener((networkEvent: NetworkEvent) => {
      const vendor = analyticsVendorsRegistry.getInstance().getVendorByUrl(networkEvent.request.url);

      // If there is no matching vendor for this network request, do nothing.
      if (!vendor) return;

      setVendorEvents((prev) => {
        const existingEvents = prev[vendor.name] || [];
        return { ...prev, [vendor.name]: [...existingEvents, networkEvent] };
      });
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

  return (
    <div className="analytics-inspector-container">
      <PrimaryToolbar clearEvents={clearEvents} settings={settings} onSettingsChange={setSettings} />

      {Object.keys(vendorEvents).length === 0 ? (
        <EmptyContainerPlaceholder
          lines={[
            "Recording Analytics events...",
            "We only support a few analytics providers right now. More providers will be added soon.",
            <div
              className="add-vendor-link"
              onClick={() => {
                window.open("https://github.com/requestly/requestly/issues/2179", "_blank", "noopener,noreferrer");
              }}
            >
              Is your platform missing? Request to add your analytics provider.
            </div>,
          ]}
        />
      ) : (
        <div className="vendor-events-container">
          {Object.keys(vendorEvents).map((vendor) => {
            const vendorInstance = analyticsVendorsRegistry.getInstance().getVendorByName(vendor);

            return (
              <Collapse
                key={vendor}
                className="vendor-event-details"
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              >
                <Collapse.Panel
                  key={vendor}
                  header={
                    <div className="vendor-events-collapse-header">
                      <span className="vendor-icon" dangerouslySetInnerHTML={{ __html: vendorInstance.icon }} />
                      <span className="vendor-name">{vendor}</span>
                    </div>
                  }
                >
                  {vendorEvents[vendor].map((event, index) => {
                    const eventDetails = vendorInstance.getEventDetails(event);

                    return <VendorEventPanel key={index} vendorName={vendor} eventDetails={eventDetails} />;
                  })}
                </Collapse.Panel>
              </Collapse>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnalyticsInspectorContainer;
