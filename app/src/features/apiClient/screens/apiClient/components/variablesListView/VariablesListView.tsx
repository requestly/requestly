import { useState } from "react";
import APIClientSidebar from "../sidebar/APIClientSidebar";
import { VariablesList } from "./components/VariablesList/VariablesList";
import { VariablesListHeader } from "./components/VariablesListHeader/VariablesListHeader";
import "./variablesListView.scss";

export const VariablesListView = () => {
  const [searchValue, setSearchValue] = useState<string>("");

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
