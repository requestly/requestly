import { useState } from "react";
import { useParams } from "react-router-dom";
import APIClientSidebar from "../sidebar/APIClientSidebar";
import { VariablesList } from "./components/VariablesList/VariablesList";
import { VariablesListHeader } from "./components/VariablesListHeader/VariablesListHeader";
import "./variablesListView.scss";

export const VariablesListView = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const { envName } = useParams();

  return (
    <div className="variables-list-view-container">
      <APIClientSidebar />
      <div className="variables-list-view">
        <VariablesListHeader searchValue={searchValue} onSearchValueChange={setSearchValue} />
        <VariablesList searchValue={searchValue} currentEnvironment={envName} />
      </div>
    </div>
  );
};
