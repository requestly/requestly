import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { actions } from "store";
import { MockServerSidebar } from "./MockServerSidebar";
import { ContainerWithSecondarySidebar } from "../common/ContainerWithSecondarySidebar";

export const MockServerContainer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.updateSecondarySidebarCollapse(false));
  }, [dispatch]);

  return <ContainerWithSecondarySidebar sidebar={<MockServerSidebar />} />;
};
