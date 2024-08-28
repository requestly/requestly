import TemplatesTable from "./components/TemplatesTable/TemplatesTable";
import { useState } from "react";
import { TemplatesTableContentHeader } from "./components/TemplatesTableContentHeader/TemplatesTableContentHeader";
import { ContentListScreen } from "componentsV2/ContentList";
import "./templatesList.css";

export const TemplatesList = () => {
  const [searchValue, setSearchValue] = useState<string>("");

  return (
    <ContentListScreen>
      <TemplatesTableContentHeader
        searchValue={searchValue}
        handleSearchValueUpdate={(value: string) => setSearchValue(value)}
      />
      <TemplatesTable searchValue={searchValue} />
    </ContentListScreen>
  );
};
