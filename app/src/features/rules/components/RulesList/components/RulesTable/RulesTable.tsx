import React, { useEffect, useMemo, useState } from "react";
import ContentTable from "componentsV2/ContentTable/ContentTable";
import useRuleTableColumns from "./hooks/useRuleTableColumns";
import { rulesToContentTableDataAdapter } from "./utils";
import { RuleObj } from "features/rules/types/rules";
import { RuleTableDataType } from "./types";
import RenameGroupModal from "components/features/rules/RenameGroupModal";
import DuplicateRuleModal from "components/features/rules/DuplicateRuleModal";
import DeleteRulesModal from "components/features/rules/DeleteRulesModal";
import useRuleTableActions from "./hooks/useRuleTableActions";
import { useRules } from "../RulesListIndex/context";
import { Rule } from "types";
import "./rulesTable.css";

interface Props {
  rules: RuleObj[];
  loading: boolean;
}

const RulesTable: React.FC<Props> = ({ rules, loading }) => {
  const [selectedRows, setSelectedRows] = useState<RuleTableDataType[]>([]);
  const { closeDuplicateRuleModal, closeRenameGroupModal, closeDeleteRuleModal } = useRuleTableActions();
  const [contentTableData, setContentTableAdaptedRules] = useState<RuleTableDataType[]>([]);
  const {
    ruleToDelete,
    ruleToDuplicate,
    isDuplicateRuleModalActive,
    isRenameGroupModalActive,
    idOfGroupToRename,
    isDeleteConfirmationModalActive,
  } = useRules();

  const rulesToDelete = useMemo(() => selectedRows.filter((row) => !row.id?.startsWith("Group")), [selectedRows]);

  const selectedGroupIds = useMemo(() => selectedRows.map((row) => row.id).filter((id) => id?.startsWith("Group")), [
    selectedRows,
  ]);

  useEffect(() => {
    const contentTableAdaptedRules = rulesToContentTableDataAdapter(rules);
    setContentTableAdaptedRules(contentTableAdaptedRules);
  }, [rules]);

  /**
   * - table header (revisit for icons)
   *
   * - group and rules name overflows
   * - group row
   *    - expanded version
   * - rule row
   *
   * - icon fixes
   *
   * - actions
   *    - styles
   *
   * - bulk actions
   *    - action
   *    - styling
   *
   * general
   * - tooltips
   * - hover effects
   *
   *
   * MODALS
   * - change group
   */

  // FIXME: cleanup this
  const options = {
    disableSelection: false,
    disableEditing: false,
    disableActions: false,
    disableFavourites: false,
    disableStatus: false,
    disableAlertActions: false,
    hideLastModifiedBy: false,
    hideCreatedBy: false,
  };

  const columns = useRuleTableColumns(options);

  return (
    <>
      {/* TODO: Add Modals Required in Rules List here */}
      {isDuplicateRuleModalActive ? (
        <DuplicateRuleModal
          close={closeDuplicateRuleModal}
          onDuplicate={closeDuplicateRuleModal}
          isOpen={isDuplicateRuleModalActive as boolean}
          rule={ruleToDuplicate as Rule}
        />
      ) : null}

      {isRenameGroupModalActive ? (
        <RenameGroupModal
          toggle={closeRenameGroupModal}
          isOpen={isRenameGroupModalActive}
          groupId={idOfGroupToRename}
        />
      ) : null}

      {isDeleteConfirmationModalActive ? (
        <DeleteRulesModal
          toggle={closeDeleteRuleModal}
          rulesToDelete={rulesToDelete?.length > 0 ? rulesToDelete : [ruleToDelete]}
          groupIdsToDelete={selectedGroupIds}
          clearSearch={() => {}} // FIXME
          isOpen={isDeleteConfirmationModalActive}
        />
      ) : null}

      <ContentTable
        columns={columns}
        data={contentTableData}
        rowKey="id"
        loading={loading}
        // bulk action here
        bulkActionBarConfig={{
          type: "default",
          options: {
            getSelectedRowsData: (selectedRows) => setSelectedRows(selectedRows),
            infoText: (selectedRules) => `${selectedRules.length} Rules Selected`,
            actions: [
              {
                label: "Activate",
                onClick: (selectedRows: any) => {
                  // Get action from useRuleTableActions hook
                  console.log("Activate Bulk Action", { selectedRows });
                },
              },
            ],
          },
        }}
      />
    </>
  );
};

export default RulesTable;
