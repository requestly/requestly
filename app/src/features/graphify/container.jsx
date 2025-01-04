import React from "react";
import { Outlet } from "react-router-dom";
import { GraphifyProvider } from "./contexts";
import { TabsLayoutContainer } from "layouts/TabsLayout";
import "./container.scss";

const GraphifyFeatureContainer = () => {
  return (
    <GraphifyProvider>
      <div className="graphify-container">
        <TabsLayoutContainer.TabsLayoutContent Outlet={(props) => <Outlet {...props} />} />
      </div>
    </GraphifyProvider>
  );
};

export default GraphifyFeatureContainer;
