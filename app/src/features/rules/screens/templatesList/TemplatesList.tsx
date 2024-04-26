import TemplatesTable from "./components/TemplatesTable/TemplatesTable";
import { useState } from "react";
import { TemplatesTableContentHeader } from "./components/TemplatesTableContentHeader/TemplatesTableContentHeader";
import "./templatesList.css";

export const TemplatesList = () => {
  const [searchValue, setSearchValue] = useState<string>("");

  return (
    <div className="templates-list-screen">
      <TemplatesTableContentHeader
        searchValue={searchValue}
        handleSearchValueUpdate={(value: string) => setSearchValue(value)}
      />
      <TemplatesTable searchValue={searchValue} />
    </div>
  );
};
