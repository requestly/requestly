import { BreadCrumb } from "componentsV2/BreadCrumb";
import { ContentListHeader } from "componentsV2/ContentList";
import React from "react";

interface TemplatesTableContentHeaderProps {
  searchValue: string;
  handleSearchValueUpdate: (value: string) => void;
}

export const TemplatesTableContentHeader: React.FC<TemplatesTableContentHeaderProps> = ({
  searchValue,
  handleSearchValueUpdate,
}) => {
  return (
    <>
      <BreadCrumb items={["Rules", "Templates"]} />
      <ContentListHeader searchValue={searchValue} setSearchValue={handleSearchValueUpdate} />
    </>
  );
};
