import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ContentTable from "componentsV2/ContentTable/ContentTable";
import useRuleTableColumns from "./hooks/useRuleTableColumns";
import { isRule, rulesToContentTableDataAdapter, localStorage } from "./utils";
import { RuleObj, RuleObjType } from "features/rules/types/rules";
import { RuleTableDataType } from "./types";
import {
  DeleteRulesModalWrapper,
  RenameGroupModalWrapper,
  DuplicateRuleModalWrapper,
  ChangeRuleGroupModalWrapper,
  UngroupOrDeleteRulesModalWrapper,
} from "./components";
import useRuleTableActions from "./hooks/useRuleTableActions";
import { RiDeleteBin2Line } from "@react-icons/all-files/ri/RiDeleteBin2Line";
import { RiUserSharedLine } from "@react-icons/all-files/ri/RiUserSharedLine";
// import { RiToggleFill } from "@react-icons/all-files/ri/RiToggleFill";
import { RiFolderSharedLine } from "@react-icons/all-files/ri/RiFolderSharedLine";
import { ImUngroup } from "@react-icons/all-files/im/ImUngroup";
// import { RiArrowDownSLine } from "@react-icons/all-files/ri/RiArrowDownSLine";
import "./rulesTable.css";

interface Props {
  rules: RuleObj[];
  loading: boolean;
}

const RulesTable: React.FC<Props> = ({ rules, loading }) => {
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [isGroupsStateUpdated, setIsGroupsStateUpdated] = useState(false);
  const [contentTableData, setContentTableAdaptedRules] = useState<RuleTableDataType[]>([]);
  const clearSelectedRowsDataCallbackRef = useRef(() => {});
  const {
    clearSelectedRows,
    handleRuleShare,
    // handleActivateOrDeactivateRecords,
    handleDeleteRecordClick,
    handleChangeRuleGroupClick,
    handleUngroupSelectedRulesClick,
  } = useRuleTableActions();

  useEffect(() => {
    const contentTableAdaptedRules = rulesToContentTableDataAdapter(rules);
    setContentTableAdaptedRules(contentTableAdaptedRules);
  }, [rules]);

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
  // const activeRulesCount = useMemo(() => getActiveRules(selectedRows).length, [selectedRows]);
  // const inactiveRulesCount = selectedRows.length - activeRulesCount;

  const getExpandedGroupRowKeys = useCallback(() => {
    return (localStorage.getItem("expandedGroups") ?? []) as string[];
  }, []);

  useEffect(() => {
    const expandedGroups = getExpandedGroupRowKeys();

    if (expandedGroups && !isGroupsStateUpdated) {
      setExpandedGroups(expandedGroups);
      setIsGroupsStateUpdated(true);
    }
  }, [expandedGroups, isGroupsStateUpdated, getExpandedGroupRowKeys]);

  const handleGroupState = (expanded: boolean, record: RuleObj) => {
    if (isRule(record)) {
      return;
    }

    if (expanded && !expandedGroups.includes(record.id)) {
      const updatedExpandedGroups = [...expandedGroups, record.id];
      setExpandedGroups(updatedExpandedGroups);
      localStorage.setItem("expandedGroups", updatedExpandedGroups);
    } else if (!expanded && expandedGroups.includes(record.id)) {
      const updatedExpandedGroups = [...expandedGroups].filter((id) => id !== record.id);
      setExpandedGroups(updatedExpandedGroups);
      localStorage.setItem("expandedGroups", updatedExpandedGroups);
    }
  };

  const clearSelectionCallback = clearSelectedRowsDataCallbackRef.current;

  return (
    <>
      {/* Add Modals Required in Rules List here */}
      <DuplicateRuleModalWrapper />
      <RenameGroupModalWrapper />
      <UngroupOrDeleteRulesModalWrapper clearSelection={clearSelectionCallback} />
      <ChangeRuleGroupModalWrapper clearSelection={clearSelectionCallback} />
      <DeleteRulesModalWrapper clearSelection={clearSelectionCallback} />

      <ContentTable
        size="middle"
        scroll={{ y: "calc(100vh - 277px)" }}
        columns={columns}
        data={contentTableData}
        rowKey="id"
        loading={loading}
        customRowClassName={(record) => (record.isFavourite ? "record-pinned" : "")}
        filterSelection={(selectedRows) => {
          return selectedRows.filter((record: RuleObj) => record.objectType !== RuleObjType.GROUP);
        }}
        expandable={{
          expandRowByClick: true,
          rowExpandable: () => true,
          defaultExpandedRowKeys: getExpandedGroupRowKeys(),
          onExpand: (expanded, record) => {
            handleGroupState(expanded, record);
          },
          // FIXME: fix custom expand icon
          // expandIcon: ({ expanded, onExpand, record }) => {
          //   console.clear();
          //   console.log({ record, expanded, expandedGroups, expandedGroupRowKeys: getExpandedGroupRowKeys() });

          //   if (!record.children) {
          //     return null;
          //   }

          //   return (
          //     <span
          //       // @ts-ignore
          //       onClick={(e) => onExpand(record, e)}
          //     >
          //       <RiArrowDownSLine
          //         className="group-expand-icon"
          //         style={{ transform: `rotate(${expanded ? "-180deg" : "0deg"})` }}
          //       />
          //     </span>
          //   );
          // },
        }}
        bulkActionBarConfig={{
          type: "default",
          options: {
            clearSelectedRows,
            infoText: (selectedRules) => `${selectedRules.length} Rules Selected`,
            actions: [
              {
                label: "Ungroup",
                icon: <ImUngroup />,
                onClick: (selectedRows, clearSelection) => {
                  handleUngroupSelectedRulesClick(selectedRows)?.then(() => clearSelection());
                },
              },
              {
                label: "Change group",
                icon: <RiFolderSharedLine />,
                onClick: (selectedRows, clearSelection) => {
                  clearSelectedRowsDataCallbackRef.current = clearSelection;
                  handleChangeRuleGroupClick(selectedRows);
                },
              },
              // {
              //   label: "Activate",
              //   icon: <RiToggleFill />,
              //   onClick: (selectedRows) => handleActivateOrDeactivateRecords(selectedRows),
              // },
              {
                label: "Share",
                icon: <RiUserSharedLine />,
                onClick: (selectedRows, clearSelection) => {
                  handleRuleShare(selectedRows, clearSelection);
                },
              },
              {
                danger: true,
                label: "Delete",
                icon: <RiDeleteBin2Line />,
                onClick: (selectedRows, clearSelection) => {
                  clearSelectedRowsDataCallbackRef.current = clearSelection;
                  handleDeleteRecordClick(selectedRows);
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
