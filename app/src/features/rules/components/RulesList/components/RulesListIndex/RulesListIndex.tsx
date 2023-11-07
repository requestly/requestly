import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "antd";
import RulesTable from "../RulesTable/RulesTable";
import ContentHeader from "componentsV2/ContentHeader/ContentHeader";
import { RuleObj } from "features/rules/types/rules";
import { getAllRuleObjs } from "store/features/rules/selectors";
import useFetchAndUpdateRules from "./hooks/useFetchAndUpdateRules";
import { RulesProvider } from "./context";
import "./rulesListIndex.scss";

interface Props {}

/**
 * - delete modal
 * - ungroup modal
 * - bulk action
 * - rule name click
 */

const RulesListIndex: React.FC<Props> = () => {
  const [isLoading, setIsLoading] = useState(true);

  // FIXME: Fetching multiple times
  // Fetch Rules here from Redux
  const ruleObjs = useSelector(getAllRuleObjs);

  useFetchAndUpdateRules({ setIsLoading: setIsLoading });

  return (
    <RulesProvider>
      <div className="rq-rules-list-container">
        {/* TODO: Add Feature Limiter Banner Here */}

        <ContentHeader
          title="My Rules"
          subtitle="Create and manage your rules from here"
          actions={[<Button type="primary">New Rule</Button>]}
        />
        <div className="rq-rules-table">
          <RulesTable rules={ruleObjs as RuleObj[]} loading={isLoading} />
        </div>
      </div>
    </RulesProvider>
  );
};

export default RulesListIndex;
