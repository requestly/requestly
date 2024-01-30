import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { Empty } from "antd";
import ContentTable from "componentsV2/ContentTable/ContentTable";
import useRuleTableColumns from "./hooks/useRuleTableColumns";
import { isRule, rulesToContentTableDataAdapter } from "./utils";
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
import { localStorage } from "utils/localStorage";
import { getUserAuthDetails } from "store/selectors";
import { toast } from "utils/Toast";
import { trackRulesListBulkActionPerformed, trackRulesSelected } from "features/rules/analytics";
import { getAllRuleObjIds } from "store/features/rules/selectors";
import "./rulesTable.css";

interface Props {
  rules: RuleObj[];
  loading: boolean;
  searchValue: string;
}

const RulesTable: React.FC<Props> = ({ rules, loading, searchValue }) => {
  const user = useSelector(getUserAuthDetails);
  const allRecordIds = useSelector(getAllRuleObjIds);
  const isFeatureLimiterOn = useFeatureIsOn("show_feature_limit_banner");
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

  const getSelectionCount = useCallback((selectedRows: any) => {
    let groups = 0;
    let rules = 0;

    selectedRows.forEach((row: any) => {
      row.objectType === RuleObjType.GROUP ? groups++ : rules++;
    });

    const formatCount = (count: number, singular: string, plural: string) => {
      return count > 0 ? `${count} ${count > 1 ? plural : singular}` : "";
    };

    const groupString = formatCount(groups, "Group", "Groups");
    const ruleString = formatCount(rules, "Rule", "Rules");

    return `${groupString}${groupString && ruleString ? " and " : ""}${ruleString} selected`;
  }, []);

  const clearSelectionCallback = clearSelectedRowsDataCallbackRef.current;
  const isFeatureLimitbannerShown = isFeatureLimiterOn && user?.isLimitReached;

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
        scroll={{ y: `calc(100vh - ${isFeatureLimitbannerShown ? "(277px + 68px)" : "277px"})` }} // 68px is Feature limit banner height
        columns={columns}
        data={contentTableData}
        rowKey="id"
        loading={loading}
        customRowClassName={(record) => (record.isFavourite ? "record-pinned" : "")}
        // filterSelection={(selectedRows) => {
        //   return selectedRows.filter((record: RuleObj) => record.objectType !== RuleObjType.GROUP);
        // }}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No rule found" />,
        }}
        filterSelection={(selectedRows) => {
          if (selectedRows.length) {
            trackRulesSelected(selectedRows.length);
          }
          return selectedRows;
        }}
        expandable={{
          expandRowByClick: true,
          rowExpandable: () => true,
          defaultExpandedRowKeys: getExpandedGroupRowKeys(),
          onExpand: (expanded, record) => {
            handleGroupState(expanded, record);
          },
          expandedRowKeys: searchValue.length
            ? allRecordIds.filter((recordId: string) => recordId.startsWith("Group"))
            : expandedGroups,
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
            infoText: (selectedRules) => getSelectionCount(selectedRules),
            actions: [
              {
                label: "Ungroup",
                icon: <ImUngroup />,
                isActionHidden: (selectedRows) => !selectedRows.some((row: any) => row?.groupId?.length > 0),
                onClick: (selectedRows, clearSelection) => {
                  const onSuccess = () => {
                    toast.success(`${selectedRows.length > 1 ? "Rules" : "Rule"} ungrouped successfully!`);
                    clearSelection();
                    trackRulesListBulkActionPerformed("ungroup");
                  };
                  handleUngroupSelectedRulesClick(selectedRows)?.then(onSuccess);
                },
              },
              {
                label: "Change group",
                icon: <RiFolderSharedLine />,
                //hide change group option if only empty groups are selected
                isActionHidden: (selectedRows) =>
                  !selectedRows.some(
                    (row: any) =>
                      (row.objectType === RuleObjType.GROUP && row.children?.length > 0) ||
                      row.objectType === RuleObjType.RULE
                  ),
                onClick: (selectedRows, clearSelection) => {
                  const onSuccess = () => {
                    clearSelection();
                    trackRulesListBulkActionPerformed("change_group");
                  };

                  clearSelectedRowsDataCallbackRef.current = onSuccess;
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
                  const onSuccess = () => {
                    clearSelection();
                    trackRulesListBulkActionPerformed("share");
                  };

                  handleRuleShare(selectedRows, onSuccess);
                },
              },
              {
                danger: true,
                label: "Delete",
                icon: <RiDeleteBin2Line />,
                onClick: (selectedRows, clearSelection) => {
                  const onSuccess = () => {
                    clearSelection();
                    trackRulesListBulkActionPerformed("delete");
                  };

                  clearSelectedRowsDataCallbackRef.current = onSuccess;
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
