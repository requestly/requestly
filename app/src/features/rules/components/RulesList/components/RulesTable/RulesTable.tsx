import React, { useCallback, useEffect, useMemo, useState } from "react";
import ContentTable from "componentsV2/ContentTable/ContentTable";
import useRuleTableColumns from "./hooks/useRuleTableColumns";
import { rulesToContentTableDataAdapter } from "./utils";
import { RuleObj } from "features/rules/types/rules";
import { RuleTableDataType } from "./types";
import RenameGroupModal from "components/features/rules/RenameGroupModal";
import DuplicateRuleModal from "components/features/rules/DuplicateRuleModal";
import DeleteRulesModal from "components/features/rules/DeleteRulesModal";
import ChangeRuleGroupModal from "components/features/rules/ChangeRuleGroupModal";
import useRuleTableActions from "./hooks/useRuleTableActions";
import { useRulesContext } from "../RulesListIndex/context";
import { Rule } from "types";
import { RiDeleteBin2Line } from "@react-icons/all-files/ri/RiDeleteBin2Line";
import { RiUserSharedLine } from "@react-icons/all-files/ri/RiUserSharedLine";
import { RiToggleFill } from "@react-icons/all-files/ri/RiToggleFill";
import { RiFolderSharedLine } from "@react-icons/all-files/ri/RiFolderSharedLine";
import { ImUngroup } from "@react-icons/all-files/im/ImUngroup";
import "./rulesTable.css";

interface Props {
  rules: RuleObj[];
  loading: boolean;
}

const RulesTable: React.FC<Props> = ({ rules, loading }) => {
  const [selectedRows, setSelectedRows] = useState<RuleTableDataType[]>([]);
  const [contentTableData, setContentTableAdaptedRules] = useState<RuleTableDataType[]>([]);
  const {
    closeDuplicateRuleModal,
    closeRenameGroupModal,
    closeDeleteRuleModal,
    closeChangeRuleGroupModal,
    handleUngroupSelectedRulesClick,
    handleChangeRuleGroupClick,
    handleActivateRecords,
    handleRuleShare,
    handleDeleteRecordClick,
  } = useRuleTableActions(setSelectedRows);
  const {
    ruleToDuplicate,
    isChangeGroupModalActive,
    isDuplicateRuleModalActive,
    isRenameGroupModalActive,
    idOfGroupToRename,
    isDeleteConfirmationModalActive,
  } = useRulesContext();

  const rulesToDelete = useMemo(() => selectedRows.filter((row) => !row.id?.startsWith("Group")), [selectedRows]);

  const selectedGroupIds = useMemo(
    () => selectedRows.map((row) => row.id).filter((id) => id?.startsWith("Group")),
    [selectedRows]
  );

  const clearSelectedRows = useCallback(() => {
    setSelectedRows([]);
  }, []);

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
   * NEXT
   * - bulk action PR
   *    - ungroup [DONE]
   *    - change group [DONE]
   *    - activate all [DONE]
   *    - deactive all
   *    - share [DONE]
   *    - delete [DONE]
   *    - cancel [DONE]
   *
   * - pin rules
   * - rule name click PR
   * - sorting + icon changes
   * - searching
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

  const columns = useRuleTableColumns(options, setSelectedRows);

  return (
    <>
      {/* Add Modals Required in Rules List here */}
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
          rulesToDelete={rulesToDelete}
          groupIdsToDelete={selectedGroupIds}
          clearSearch={clearSelectedRows} // FIXME
          isOpen={isDeleteConfirmationModalActive}
        />
      ) : null}

      {isChangeGroupModalActive ? (
        <ChangeRuleGroupModal
          clearSearch={clearSelectedRows} // FIXME
          isOpen={isChangeGroupModalActive}
          toggle={closeChangeRuleGroupModal}
          mode="SELECTED_RULES"
          selectedRules={selectedRows}
        />
      ) : null}

      <ContentTable
        columns={columns}
        data={contentTableData}
        rowKey="id"
        loading={loading}
        customRowClassName={(record) => (record.isFavourite ? "record-pinned" : "")}
        bulkActionBarConfig={{
          type: "default",
          options: {
            clearSelectedRows,
            infoText: (selectedRules) => `${selectedRules.length} Rules Selected`,
            actions: [
              {
                label: "Ungroup",
                icon: <ImUngroup />,
                onClick: (selectedRows) => handleUngroupSelectedRulesClick(selectedRows),
              },
              {
                label: "Change group",
                icon: <RiFolderSharedLine />,
                onClick: (selectedRows) => handleChangeRuleGroupClick(selectedRows),
              },
              {
                label: "Activate",
                icon: <RiToggleFill />,
                onClick: (selectedRows) => handleActivateRecords(selectedRows),
              },
              {
                label: "Share",
                icon: <RiUserSharedLine />,
                onClick: (selectedRows) => handleRuleShare(selectedRows),
              },
              {
                danger: true,
                label: "Delete",
                icon: <RiDeleteBin2Line />,
                onClick: (selectedRows) => handleDeleteRecordClick(selectedRows),
              },
            ],
          },
        }}
      />
    </>
  );
};

export default RulesTable;
