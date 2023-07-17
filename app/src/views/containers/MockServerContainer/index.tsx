import React from "react";
import { MockServerSidebar } from "./MockServerSidebar";
import { ContainerWithSecondarySidebar } from "../common/ContainerWithSecondarySidebar";
import { useResetSecondarySidebarCollapse } from "../common/hooks/useResetSecondarySidebarCollapse";

export const MockServerContainer: React.FC = () => {
  useResetSecondarySidebarCollapse();

  return <ContainerWithSecondarySidebar sidebar={<MockServerSidebar />} />;
};
