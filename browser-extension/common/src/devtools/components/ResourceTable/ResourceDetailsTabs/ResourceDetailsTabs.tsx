import React, { ReactElement, memo } from "react";
// @ts-ignore
import { ObjectInspector } from "@devtools-ds/object-inspector";
import { Navigation } from "@devtools-ds/navigation";
import { DetailsTab } from "../types";
import "./resourceDetailsTabs.scss";

interface Props<ResourceType> {
  resource: ResourceType;
  tabs: DetailsTab<ResourceType>[];
  close: () => void;
}

const ResourceDetailsTabs = <ResourceType,>({
  resource,
  tabs,
  close,
}: Props<ResourceType>): ReactElement => {
  return (
    <div className="rq-resource-details">
      <Navigation>
        <Navigation.Controls className="rq-resource-details-header">
          <Navigation.Left>
            <Navigation.Button
              icon={<span>&times;</span>}
              aria-label="Close"
              title="Close"
              onClick={close}
            />
          </Navigation.Left>
          <Navigation.TabList>
            {tabs.map((tab) => (
              <Navigation.Tab
                key={tab.key}
                className="rq-resource-details-tab"
                id={tab.key}
              >
                {tab.label}
              </Navigation.Tab>
            ))}
          </Navigation.TabList>
        </Navigation.Controls>
        <Navigation.Panels>
          {tabs.map((tab) => (
            <Navigation.Panel
              key={tab.key}
              className="rq-resource-details-content"
            >
              {tab.render(resource)}
            </Navigation.Panel>
          ))}
        </Navigation.Panels>
      </Navigation>
    </div>
  );
};

export default memo(ResourceDetailsTabs);
