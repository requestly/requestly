import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useFeatureIsOn, useFeatureValue } from "@growthbook/growthbook-react";
import { Empty } from "antd";
import useRuleTableColumns from "./hooks/useRuleTableColumns";
import { recordsToContentTableDataAdapter } from "./utils";
import { isRule, isGroup } from "features/rules/utils";
import { RecordStatus, StorageRecord } from "features/rules/types/rules";
import { RuleTableRecord } from "./types";
import { RiDeleteBin2Line } from "@react-icons/all-files/ri/RiDeleteBin2Line";
import { RiUserSharedLine } from "@react-icons/all-files/ri/RiUserSharedLine";
import { RiFolderSharedLine } from "@react-icons/all-files/ri/RiFolderSharedLine";
import { MdOutlineToggleOn } from "@react-icons/all-files/md/MdOutlineToggleOn";
import { ImUngroup } from "@react-icons/all-files/im/ImUngroup";
import { getUserAuthDetails } from "store/selectors";
import { toast } from "utils/Toast";
import { trackRulesListBulkActionPerformed, trackRulesSelected } from "features/rules/analytics";
import { getAllRecords } from "store/features/rules/selectors";
import { PREMIUM_RULE_TYPES } from "features/rules/constants";
import { enhanceRecords, normalizeRecords } from "./utils/rules";
import { ContentListTable, useContentListTableContext, withContentListTableContext } from "componentsV2/ContentList";
import { useRulesActionContext } from "features/rules/context/actions";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./rulesTable.css";
import { submitAttrUtil } from "utils/AnalyticsUtils";

interface Props {
  records: StorageRecord[];
  allRecordsMap: { [id: string]: StorageRecord };
  loading: boolean;
  searchValue: string;
}

const RulesTable: React.FC<Props> = ({ records, loading, searchValue, allRecordsMap }) => {
  const { selectedRows, clearSelectedRows } = useContentListTableContext();

  const user = useSelector(getUserAuthDetails);
  const allRecords = useSelector(getAllRecords);

  const [contentTableData, setContentTableData] = useState<RuleTableRecord[]>([]);
  const [isPremiumRulesToggleChecked, setIsPremiumRulesToggleChecked] = useState(false);
  const [isBulkRecordsStatusUpdating, setIsBulkRecordsStatusUpdating] = useState(false);

  const isFeatureLimiterOn = useFeatureIsOn("show_feature_limit_banner");
  const isBackgateRestrictionEnabled = useFeatureValue("backgates_restriction", false);
  const isUpgradePopoverEnabled = useFeatureValue("show_upgrade_popovers", false);
  const {
    recordsUngroupAction,
    recordsChangeGroupAction,
    recordsShareAction,
    recordsDeleteAction,
    recordsStatusUpdateAction,
  } = useRulesActionContext();

  useEffect(() => {
    const enhancedRecords = enhanceRecords(records, allRecordsMap);
    const contentTableAdaptedRecords = recordsToContentTableDataAdapter(enhancedRecords);
    setContentTableData(contentTableAdaptedRecords);
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
        recordsStatusUpdateAction(activePremiumRules, RecordStatus.INACTIVE);
      }
      setIsPremiumRulesToggleChecked(true);
    }
  }, [
    allRecords,
    user?.details?.isPremium,
    loading,
    isPremiumRulesToggleChecked,
    recordsStatusUpdateAction,
    isBackgateRestrictionEnabled,
    isUpgradePopoverEnabled,
  ]);

  useEffect(() => {
    if (allRecords) {
      const updatedCountMap = allRecords.reduce((accumulator, record) => {
        if (isRule(record)) {
          if (accumulator[record.ruleType]) {
            accumulator[record.ruleType] += 1;
          } else {
            accumulator[record.ruleType] = 1;
          }
        }
        return accumulator;
      }, {} as Record<string, number>);

      Object.values(GLOBAL_CONSTANTS.RULE_TYPES).forEach((ruleType) => {
        if (!updatedCountMap[ruleType]) {
          submitAttrUtil(ruleType + "_rules", 0);
        }

        submitAttrUtil(ruleType + "_rules", updatedCountMap[ruleType]);
      });
    }
  }, [allRecords]);

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

  const isFeatureLimitbannerShown = isFeatureLimiterOn && user?.isLimitReached;

  const toggleRecordsBulkOptionLabel = useMemo(() => {
    const selectedRecords = selectedRows as StorageRecord[];
    const isAllRecordsActive = selectedRecords.every((record) => {
      return allRecordsMap[record.id].status === RecordStatus.ACTIVE;
    });

    return isAllRecordsActive ? "Deactivate" : "Activate";
  }, [selectedRows, allRecordsMap]);

  return (
    <>
      {/* Add Modals Required in Rules List here */}

      <ContentListTable
        id="rules-list-table"
        size="middle"
        scroll={{ y: `calc(100vh - ${isFeatureLimitbannerShown ? "(232px + 68px)" : "232px"})` }} // 68px is Feature limit banner height
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
                  recordsUngroupAction(normalizeRecords(selectedRows)).then(onSuccess);
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

                  recordsChangeGroupAction(normalizeRecords(selectedRows), onSuccess);
                },
              },
              {
                label: toggleRecordsBulkOptionLabel,
                icon: <MdOutlineToggleOn />,
                loading: isBulkRecordsStatusUpdating,
                onClick: (selectedRows) => {
                  const onSuccess = () => {
                    setIsBulkRecordsStatusUpdating(false);
                    toast.success(`All records ${toggleRecordsBulkOptionLabel.toLowerCase()}d!`);
                    trackRulesListBulkActionPerformed("records_toggle");
                  };

                  const updatedValue =
                    toggleRecordsBulkOptionLabel.toLowerCase() === "activate"
                      ? RecordStatus.ACTIVE
                      : RecordStatus.INACTIVE;

                  setIsBulkRecordsStatusUpdating(true);
                  recordsStatusUpdateAction(normalizeRecords(selectedRows), updatedValue, onSuccess);
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

                  recordsShareAction(normalizeRecords(selectedRows), onSuccess);
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

                  recordsDeleteAction(normalizeRecords(selectedRows), onSuccess);
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
