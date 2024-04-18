import React from "react";
import { Outlet } from "react-router-dom";
import { MocksSidebar } from "./components/MocksSidebar/MocksSidebar";
import { SecondarySidebarLayout } from "componentsV2/SecondarySidebar";

const MocksFeaturecontainer: React.FC = () => {
  return (
    <SecondarySidebarLayout secondarySidebar={<MocksSidebar />}>
      <Outlet />
    </SecondarySidebarLayout>
  );
};

export default MocksFeaturecontainer;
