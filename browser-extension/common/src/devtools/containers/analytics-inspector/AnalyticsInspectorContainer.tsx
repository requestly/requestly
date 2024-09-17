import React, { useCallback, useEffect, useRef, useState } from "react";
import { NetworkEvent, NetworkSettings } from "../../types";
import EmptyContainerPlaceholder from "../../components/EmptyContainerPlaceholder/EmptyContainerPlaceholder";
import { Collapse } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
// @ts-ignore
import getAnalyticsVendorsRegistry from "@requestly/analytics-vendors";
import { VendorEvent } from "./components/VendorEvent/VendorEvent";
import "./analyticsInspectorContainer.scss";

const AnalyticsInspectorContainer: React.FC = () => {
  // @ts-ignore
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
        //clearEvents();
      }
    });
  }, [clearEvents]);

  useEffect(() => {
    preserveLogRef.current = settings.preserveLog;
  }, [settings]);

  return (
    <div className="analytics-inspector-container">
      {Object.keys(vendorEvents).length === 0 ? (
        <EmptyContainerPlaceholder
          lines={[
            "Recording Analytics events...(Only BlueCore event supported, More vendors will be added soon)",
            "Perform an action that triggers event.",
          ]}
        />
      ) : (
        <div>
          {Object.keys(vendorEvents).map((vendor) => {
            return (
              <Collapse
                key={vendor}
                className="vendor-event-details"
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
              >
                <Collapse.Panel key={vendor} header={vendor}>
                  {vendorEvents[vendor].map((event, index) => {
                    return <VendorEvent key={index} vendorName={vendor} event={event} />;
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
