import React, { memo, useMemo } from "react";
import { NetworkEvent } from "../../types";
// @ts-ignore
import { ObjectInspector } from "@devtools-ds/object-inspector";
import { Navigation } from "@devtools-ds/navigation";
import "./networkEventDetails.scss";
import HeadersTabContent from "./HeadersTabContent/HeadersTabContent";
import GeneralTabContent from "./GeneralTabContent/GeneralTabContent";
import PayloadTabContent from "./PayloadTabContent/PayloadTabContent";

interface Props {
  networkEvent: NetworkEvent;
  close: () => void;
}

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

const NetworkEventDetails: React.FC<Props> = ({ networkEvent, close }) => {
  const tabs = useMemo<Tab[]>(() => {
    return [
      {
        id: "network-general-info",
        label: "General",
        content: <GeneralTabContent networkEvent={networkEvent} />,
      },
      {
        id: "network-headers",
        label: "Headers",
        content: <HeadersTabContent networkEvent={networkEvent} />,
      },
      {
        id: "network-payload",
        label: "Payload",
        content: <PayloadTabContent networkEvent={networkEvent} />,
      },
      {
        id: "network-full-data",
        label: "Full",
        content: (
          <ObjectInspector
            expandLevel={3}
            data={networkEvent}
            includePrototypes={false}
            className="object-inspector"
          />
        ),
      },
    ];
  }, [networkEvent]);

  return (
    <div className="network-event-details">
      <Navigation>
        <Navigation.Controls className="network-event-details-header">
          <Navigation.Left>
            <Navigation.Button
              icon={<span>&times;</span>}
              aria-label="Close panel"
              title="Close"
              onClick={close}
            />
          </Navigation.Left>
          <Navigation.TabList>
            {tabs.map((tab) => (
              <Navigation.Tab
                key={tab.id}
                className="network-event-details-tab"
                id={tab.id}
              >
                {tab.label}
              </Navigation.Tab>
            ))}
          </Navigation.TabList>
        </Navigation.Controls>
        <Navigation.Panels>
          {tabs.map((tab) => (
            <Navigation.Panel
              key={tab.id}
              className="network-event-details-content"
            >
              {tab.content}
            </Navigation.Panel>
          ))}
        </Navigation.Panels>
      </Navigation>
    </div>
  );
};

export default memo(NetworkEventDetails);
