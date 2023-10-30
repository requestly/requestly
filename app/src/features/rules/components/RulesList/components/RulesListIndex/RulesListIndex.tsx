import React, { useState } from "react";
import RulesTable from "../RulesTable/RulesTable";
import ContentHeader from "componentsV2/ContentHeader/ContentHeader";
import { RuleObj } from "features/rules/types/rules";
import { useSelector } from "react-redux";
import { getAllRuleObjs } from "store/features/rules/selectors";
import useFetchAndUpdateRules from "./hooks/useFetchAndUpdateRules";
import { Button } from "antd";

interface Props {}

const RulesListIndex: React.FC<Props> = () => {
  const [isLoading, setIsLoading] = useState(true);

  // FIXME: Fetching multiple times
  // Fetch Rules here from Redux
  const ruleObjs = useSelector(getAllRuleObjs);
  console.log({ ruleObjs });

  useFetchAndUpdateRules({ setIsLoading: setIsLoading });

  return (
    <>
      {/* TODO: Add Feature Limiter Banner Here */}
      {/* TODO: Add Modals Required in Rules List here */}
      <ContentHeader
        title="My Rules"
        subtitle="Create and manage your rules from here"
        actions={[<Button type="primary">New Rule</Button>]}
      />
      <RulesTable rules={ruleObjs as RuleObj[]} loading={isLoading} />
    </>
  );
};

export default RulesListIndex;
