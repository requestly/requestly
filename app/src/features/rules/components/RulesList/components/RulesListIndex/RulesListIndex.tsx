import React from "react";
// @ts-ignore
import rules from "./rules.json";
import RulesTable from "../RulesTable/RulesTable";
import ContentHeader from "componentsV2/ContentHeader/ContentHeader";
import { RuleObj } from "features/rules/types/rules";

interface Props {}

const RulesListIndex: React.FC<Props> = () => {
  // Fetch Rules here for StorageService

  return (
    <>
      <ContentHeader />
      <RulesTable rules={rules as RuleObj[]} />
    </>
  );
};

export default RulesListIndex;
