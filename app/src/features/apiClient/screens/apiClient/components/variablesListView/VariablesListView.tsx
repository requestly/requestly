import { useEffect, useState } from "react";
import { Skeleton } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import APIClientSidebar from "../sidebar/APIClientSidebar";
import { VariablesList } from "./components/VariablesList/VariablesList";
import { VariablesListHeader } from "./components/VariablesListHeader/VariablesListHeader";
import "./variablesListView.scss";

export const VariablesListView = () => {
  const { getCurrentEnvironment } = useEnvironmentManager();
  const { currentEnvironmentId } = getCurrentEnvironment();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");

  useEffect(() => {
    if (!currentEnvironmentId) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [currentEnvironmentId]);

  if (isLoading) {
    return <Skeleton active />;
  }

  return (
    <div className="variables-list-view-container">
      <APIClientSidebar />
      <div className="variables-list-view">
        <VariablesListHeader searchValue={searchValue} onSearchValueChange={setSearchValue} />
        <VariablesList searchValue={searchValue} />
      </div>
    </div>
  );
};
