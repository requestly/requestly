import React from "react";
import { MockServerSidebar } from "./MockServerSidebar";
import { ContainerWithSecondarySidebar } from "../common/ContainerWithSecondarySidebar";

export const MockServerContainer: React.FC = () => {
  return (
    <ContainerWithSecondarySidebar>
      <MockServerSidebar />
    </ContainerWithSecondarySidebar>
  );
};
