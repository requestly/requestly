import React from "react";
import { DetailsTab } from "@requestly-ui/resource-table";
import { RQNetworkEvent } from "../../../types";
import GeneralTabContent from "./GeneralTabContent/GeneralTabContent";
import HeadersTabContent from "./HeadersTabContent/HeadersTabContent";
import PayloadTabContent from "./PayloadTabContent/PayloadTabContent";
// @ts-ignore
import { ObjectInspector } from "@devtools-ds/object-inspector";
import ResponseTabContent from "./ResponseTabContent/ResponseTabContent";

const networkEventDetailsTabs: DetailsTab<RQNetworkEvent>[] = [
  {
    key: "general",
    label: "General",
    render: (networkEvent) => <GeneralTabContent networkEvent={networkEvent} />,
  },
  {
    key: "headers",
    label: "Headers",
    render: (networkEvent) => <HeadersTabContent networkEvent={networkEvent} />,
  },
  {
    key: "payload",
    label: "Payload",
    render: (networkEvent) => <PayloadTabContent networkEvent={networkEvent} />,
  },
  {
    key: "response",
    label: "Response",
    render: (networkEvent) => <ResponseTabContent networkEvent={networkEvent} />,
  },
  {
    key: "har",
    label: "HAR",
    render: (networkEvent) => (
      <ObjectInspector expandLevel={3} data={networkEvent} includePrototypes={false} className="object-inspector" />
    ),
  },
];

export default networkEventDetailsTabs;
