import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "antd";
import RulesTable from "../RulesTable/RulesTable";
import ContentHeader from "componentsV2/ContentHeader/ContentHeader";
import { RuleObj } from "features/rules/types/rules";
import { getAllRuleObjs, getRuleActiveModals } from "store/features/rules/selectors";
import useFetchAndUpdateRules from "./hooks/useFetchAndUpdateRules";
import { RulesListProvider } from "./context";
import "./rulesListIndex.scss";

interface Props {}

const RulesListIndex: React.FC<Props> = () => {
  const [isLoading, setIsLoading] = useState(true);
  const activeModals = useSelector(getRuleActiveModals);
  const { closeDuplicateRuleModal, closeRenameGroupModal } = useRuleTableActions();

  // FIXME: Fetching multiple times
  // Fetch Rules here from Redux
  const ruleObjs = useSelector(getAllRuleObjs);

  useFetchAndUpdateRules({ setIsLoading: setIsLoading });

  return (
    <RulesListProvider>
      <div className="rq-rules-list-container">
        {/* TODO: Add Feature Limiter Banner Here */}

  return (
    <div className="rq-rules-list-container">
      {/* TODO: Add Feature Limiter Banner Here */}

      {/* TODO: Add Modals Required in Rules List here */}
      {activeModals?.duplicateRuleModal?.isActive ? (
        <DuplicateRuleModal
          close={closeDuplicateRuleModal}
          onDuplicate={closeDuplicateRuleModal}
          isOpen={activeModals?.duplicateRuleModal?.isActive}
          rule={activeModals?.duplicateRuleModal?.props?.ruleToDuplicate as Rule}
        />
      ) : null}

      {activeModals?.renameGroupModal?.isActive ? (
        <RenameGroupModal
          toggle={closeRenameGroupModal}
          isOpen={activeModals.renameGroupModal.isActive}
          groupId={activeModals.renameGroupModal.props.groupId}
        />
      ) : null}

      <ContentHeader
        title="My Rules"
        subtitle="Create and manage your rules from here"
        actions={[<Button type="primary">New Rule</Button>]}
      />
      <div className="rq-rules-table">
        <RulesTable rules={ruleObjs as RuleObj[]} loading={isLoading} />
      </div>
    </RulesListProvider>
  );
};

export default RulesListIndex;
