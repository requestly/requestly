import React, { useEffect, useMemo, useState } from "react";
import ContentTable from "componentsV2/ContentTable/ContentTable";
import useRuleTableColumns from "./hooks/useRuleTableColumns";
import { rulesToContentTableDataAdapter } from "./utils";
import { RuleObj } from "features/rules/types/rules";
import { RuleTableDataType } from "./types";
import {
  DeleteRulesModalWrapper,
  RenameGroupModalWrapper,
  DuplicateRuleModalWrapper,
  ChangeRuleGroupModalWrapper,
} from "./components";
import useRuleTableActions from "./hooks/useRuleTableActions";
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
  const [contentTableData, setContentTableAdaptedRules] = useState<RuleTableDataType[]>([]);
  const {
    clearSelectedRows,
    handleRuleShare,
    handleActivateRecords,
    handleDeleteRecordClick,
    handleChangeRuleGroupClick,
    handleUngroupSelectedRulesClick,
  } = useRuleTableActions();

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
   * - pin rules [DONE]
   * - rule name click PR
   * - sorting + icon changes
   * - searching
   */

  // FIXME: cleanup this
  const options = useMemo(() => {
    return {
      disableSelection: false,
      disableEditing: false,
      disableActions: false,
      disableFavourites: false,
      disableStatus: false,
      disableAlertActions: false,
      hideLastModifiedBy: false,
      hideCreatedBy: false,
    };
  }, []);

  const columns = useRuleTableColumns(options);

  return (
    <>
      {/* Add Modals Required in Rules List here */}
      <DuplicateRuleModalWrapper />
      <RenameGroupModalWrapper />
      <DeleteRulesModalWrapper />
      <ChangeRuleGroupModalWrapper />

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
