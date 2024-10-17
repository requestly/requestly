import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import APIClientSidebar from "../sidebar/APIClientSidebar";
import { VariablesList } from "./components/VariablesList/VariablesList";
import { VariablesListHeader } from "./components/VariablesListHeader/VariablesListHeader";
import "./variablesListView.scss";

export const VariablesListView = () => {
  const { isEnvironmentsLoading } = useEnvironmentManager();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const { envId } = useParams();

  useEffect(() => {
    if (isEnvironmentsLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [isEnvironmentsLoading]);

  if (isLoading) {
    return <Skeleton active />;
  }

  return (
    <div className="variables-list-view-container">
      <APIClientSidebar />
      <div className="variables-list-view">
        <VariablesListHeader searchValue={searchValue} onSearchValueChange={setSearchValue} />
        <VariablesList searchValue={searchValue} currentEnvironmentId={envId} />
      </div>
    </div>
  );
};
