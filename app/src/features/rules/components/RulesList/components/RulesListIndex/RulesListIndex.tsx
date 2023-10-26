import React from "react";
// @ts-ignore
import rules from "./rules.json";
import RulesTable from "../RulesTable/RulesTable";
import ContentHeader from "componentsV2/ContentHeader/ContentHeader";

interface Props {}

const RulesListIndex: React.FC<Props> = ({}) => {
  return (
    <>
      <ContentHeader />
      <RulesTable />
    </>
  );
};

export default RulesListIndex;
