import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useFeatureIsOn, useFeatureValue } from "@growthbook/growthbook-react";
import { Empty } from "antd";
import ContentListTable from "componentsV2/ContentList/ContentListTable/ContentListTable";
import useRuleTableColumns from "./hooks/useRuleTableColumns";
import { isRule, isGroup, recordsToContentTableDataAdapter } from "./utils";
import { RecordStatus, StorageRecord } from "features/rules/types/rules";
import { RuleTableRecord } from "./types";
import {
  DeleteRecordsModalWrapper,
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
import { getAllRecordIds, getAllRecords } from "store/features/rules/selectors";
import { PREMIUM_RULE_TYPES } from "features/rules/constants";
import "./rulesTable.css";
import { enhanceRecords } from "./utils/rules";
import { ImportRulesModalWrapper } from "./components/modals/ImportRulesModal/ImportRulesModalWrapper";
import { CreateNewRuleGroupModalWrapper } from "./components/modals/CreateNewRuleGroupModalWrapper";
import {
  useContentListTableContext,
  withContentListTableContext,
} from "componentsV2/ContentList/ContentListTable/context";

interface Props {
  records: StorageRecord[];
  allRecordsMap: { [id: string]: StorageRecord };
  loading: boolean;
  searchValue: string;
}

const RulesTable: React.FC<Props> = ({ records, loading, searchValue, allRecordsMap }) => {
  const { clearSelectedRows } = useContentListTableContext();

  const user = useSelector(getUserAuthDetails);
  const allRecordIds = useSelector(getAllRecordIds);
  const allRecords = useSelector(getAllRecords);
  const isFeatureLimiterOn = useFeatureIsOn("show_feature_limit_banner");
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [isGroupsStateUpdated, setIsGroupsStateUpdated] = useState(false);
  const [contentTableData, setContentTableData] = useState<RuleTableRecord[]>([]);
  const [isPremiumRulesToggleChecked, setIsPremiumRulesToggleChecked] = useState(false);
  // const clearSelectedRowsDataCallbackRef = useRef(() => {});
  const {
    handleRecordsShare,
    handleRecordsStatusToggle,
    handleRecordsDelete,
    handleRecordsChangeGroup,
    handleRecordsUngroup,
  } = useRuleTableActions();
  const isBackgateRestrictionEnabled = useFeatureValue("backgates_restriction", false);
  const isUpgradePopoverEnabled = useFeatureValue("show_upgrade_popovers", false);

  useEffect(() => {
    console.log({ records, allRecordsMap });
    const enhancedRecords = enhanceRecords(records, allRecordsMap);
    console.log({ enhancedRecords });

    const contentTableAdaptedRecords = recordsToContentTableDataAdapter(enhancedRecords);
    setContentTableData(contentTableAdaptedRecords);
    console.log({ records, contentTableAdaptedRecords, enhancedRecords });
  }, [records, allRecordsMap]);

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

  // TODO
  // const activeRulesCount = useMemo(() => getActiveRules(selectedRows).length, [selectedRows]);
  // const inactiveRulesCount = selectedRows.length - activeRulesCount;

  // const getExpandedGroupRowKeys = useCallback(() => {
  //   return (localStorage.getItem("expandedGroups") ?? []) as string[];
  // }, []);

  // useEffect(() => {
  //   const expandedGroups = getExpandedGroupRowKeys();

  //   if (expandedGroups && !isGroupsStateUpdated) {
  //     setExpandedGroups(expandedGroups);
  //     setIsGroupsStateUpdated(true);
  //   }
  // }, [expandedGroups, isGroupsStateUpdated, getExpandedGroupRowKeys]);

  // TODO: Why?
  useEffect(() => {
    if (!loading && !isPremiumRulesToggleChecked && isBackgateRestrictionEnabled && isUpgradePopoverEnabled) {
      const activePremiumRules = allRecords.reduce((accumulator, record) => {
        if (
          isRule(record) &&
          !user?.details?.isPremium &&
          record.status === RecordStatus.ACTIVE &&
          PREMIUM_RULE_TYPES.includes(record.ruleType)
        ) {
          accumulator.push(record);
        }
        return accumulator;
      }, []);

      if (activePremiumRules.length) {
        handleRecordsStatusToggle(activePremiumRules, false);
      }
      setIsPremiumRulesToggleChecked(true);
    }
  }, [
    allRecords,
    user?.details?.isPremium,
    loading,
    isPremiumRulesToggleChecked,
    handleRecordsStatusToggle,
    isBackgateRestrictionEnabled,
    isUpgradePopoverEnabled,
  ]);

  // const handleGroupState = (expanded: boolean, record: StorageRecord) => {
  //   if (isRule(record)) {
  //     return;
  //   }

  //   if (expanded && !expandedGroups.includes(record.id)) {
  //     const updatedExpandedGroups = [...expandedGroups, record.id];
  //     setExpandedGroups(updatedExpandedGroups);
  //     localStorage.setItem("expandedGroups", updatedExpandedGroups);
  //   } else if (!expanded && expandedGroups.includes(record.id)) {
  //     const updatedExpandedGroups = [...expandedGroups].filter((id) => id !== record.id);
  //     setExpandedGroups(updatedExpandedGroups);
  //     localStorage.setItem("expandedGroups", updatedExpandedGroups);
  //   }
  // };

  const getSelectionCount = useCallback((selectedRows: StorageRecord[]) => {
    let groups = 0;
    let rules = 0;

    selectedRows.forEach((record) => {
      isGroup(record) ? groups++ : rules++;
    });

    const formatCount = (count: number, singular: string, plural: string) => {
      return count > 0 ? `${count} ${count > 1 ? plural : singular}` : "";
    };

    const groupString = formatCount(groups, "Group", "Groups");
    const ruleString = formatCount(rules, "Rule", "Rules");

    return `${groupString}${groupString && ruleString ? " and " : ""}${ruleString} selected`;
  }, []);

  // const clearSelectionCallback = clearSelectedRowsDataCallbackRef.current;
  const isFeatureLimitbannerShown = isFeatureLimiterOn && user?.isLimitReached;

  return (
    <>
      {/* Add Modals Required in Rules List here */}
      <DuplicateRuleModalWrapper />
      <RenameGroupModalWrapper />
      <UngroupOrDeleteRulesModalWrapper />
      <ChangeRuleGroupModalWrapper />
      <DeleteRecordsModalWrapper />
      <ImportRulesModalWrapper />
      <CreateNewRuleGroupModalWrapper />

      <ContentListTable
        size="middle"
        scroll={{ y: `calc(100vh - ${isFeatureLimitbannerShown ? "(277px + 68px)" : "277px"})` }} // 68px is Feature limit banner height
        columns={columns}
        data={contentTableData}
        rowKey="id"
        loading={loading}
        customRowClassName={(record) => (record.isFavourite ? "record-pinned" : "")}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No rule found" />,
        }}
        onRecordSelection={(selectedRows) => {
          if (selectedRows.length) {
            trackRulesSelected(selectedRows.length);
          }
        }}
        // expandable={{
        //   expandRowByClick: true,
        //   rowExpandable: () => true,
        //   defaultExpandedRowKeys: getExpandedGroupRowKeys(),
        //   onExpand: (expanded, record) => {
        //     handleGroupState(expanded, record);
        //   },
        //   expandedRowKeys: searchValue.length
        //     ? allRecordIds.filter((recordId: string) => recordId.startsWith("Group"))
        //     : expandedGroups,
        //   // FIXME: fix custom expand icon
        //   // expandIcon: ({ expanded, onExpand, record }) => {
        //   //   console.clear();
        //   //   console.log({ record, expanded, expandedGroups, expandedGroupRowKeys: getExpandedGroupRowKeys() });

        //   //   if (!record.children) {
        //   //     return null;
        //   //   }

        //   //   return (
        //   //     <span
        //   //       // @ts-ignore
        //   //       onClick={(e) => onExpand(record, e)}
        //   //     >
        //   //       <RiArrowDownSLine
        //   //         className="group-expand-icon"
        //   //         style={{ transform: `rotate(${expanded ? "-180deg" : "0deg"})` }}
        //   //       />
        //   //     </span>
        //   //   );
        //   // },
        // }}
        bulkActionBarConfig={{
          options: {
            infoText: (selectedRules) => getSelectionCount(selectedRules),
            actionButtons: [
              {
                label: "Ungroup",
                icon: <ImUngroup />,
                hidden: (selectedRows) => !selectedRows.some((row: any) => row?.groupId?.length > 0),
                onClick: (selectedRows) => {
                  const onSuccess = () => {
                    toast.success(`${selectedRows.length > 1 ? "Rules" : "Rule"} ungrouped successfully!`);
                    clearSelectedRows();
                    trackRulesListBulkActionPerformed("ungroup");
                  };
                  handleRecordsUngroup(selectedRows).then(onSuccess);
                },
              },
              {
                label: "Change group",
                icon: <RiFolderSharedLine />,
                hidden: (selectedRows) =>
                  !selectedRows.some((row) => (isGroup(row) && row.children?.length > 0) || isRule(row)),
                onClick: (selectedRows) => {
                  const onSuccess = () => {
                    clearSelectedRows();
                    trackRulesListBulkActionPerformed("change_group");
                  };

                  handleRecordsChangeGroup(selectedRows, onSuccess);
                },
              },
              {
                label: "Share",
                icon: <RiUserSharedLine />,
                onClick: (selectedRows) => {
                  const onSuccess = () => {
                    clearSelectedRows();
                    trackRulesListBulkActionPerformed("share");
                  };

                  handleRecordsShare(selectedRows, onSuccess);
                },
              },
              {
                danger: true,
                label: "Delete",
                icon: <RiDeleteBin2Line />,
                onClick: (selectedRows) => {
                  const onSuccess = () => {
                    console.log("Delete Duccess");
                    clearSelectedRows();
                    trackRulesListBulkActionPerformed("delete");
                  };

                  handleRecordsDelete(selectedRows, onSuccess);
                },
              },
            ],
          },
        }}
      />
    </>
  );
};

export default withContentListTableContext(RulesTable);
