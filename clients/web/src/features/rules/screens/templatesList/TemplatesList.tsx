import TemplatesTable from "./components/TemplatesTable/TemplatesTable";
import { useState } from "react";
import { TemplatesTableContentHeader } from "./components/TemplatesTableContentHeader/TemplatesTableContentHeader";
import { ContentListScreen } from "componentsV2/ContentList";
import "./templatesList.css";
import { isSafariBrowser } from "actions/ExtensionActions";
import { SafariLimitedSupportView } from "componentsV2/SafariExtension/SafariLimitedSupportView";

export const TemplatesList = () => {
  const [searchValue, setSearchValue] = useState<string>("");

  if (isSafariBrowser()) {
    return <SafariLimitedSupportView />;
  }

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
