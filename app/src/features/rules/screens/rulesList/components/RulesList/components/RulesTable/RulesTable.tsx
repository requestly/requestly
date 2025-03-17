import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFeatureIsOn, useFeatureValue } from "@growthbook/growthbook-react";
import { Empty } from "antd";
import useRuleTableColumns from "./hooks/useRuleTableColumns";
import { recordsToContentTableDataAdapter } from "./utils";
import { isRule, isGroup } from "features/rules/utils";
import { RuleTableRecord } from "./types";
import { RiDeleteBin2Line } from "@react-icons/all-files/ri/RiDeleteBin2Line";
import { RiUserSharedLine } from "@react-icons/all-files/ri/RiUserSharedLine";
import { RiFolderSharedLine } from "@react-icons/all-files/ri/RiFolderSharedLine";
import { MdOutlineToggleOn } from "@react-icons/all-files/md/MdOutlineToggleOn";
import { ImUngroup } from "@react-icons/all-files/im/ImUngroup";
import { getAppMode, getIsAppBannerVisible, getIsSampleRulesImported, getIsRefreshRulesPending } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { toast } from "utils/Toast";
import {
  trackRulesListBulkActionPerformed,
  trackRulesSelected,
  trackSampleRulesImported,
} from "features/rules/analytics";
import { getAllRecords } from "store/features/rules/selectors";
import { PREMIUM_RULE_TYPES } from "features/rules/constants";
import {
  ContentListTable,
  ContentListTableProps,
  useContentListTableContext,
  withContentListTableContext,
} from "componentsV2/ContentList";
import { enhanceRecords, importSampleRules, normalizeRecords } from "./utils/rules";
import { useRulesActionContext } from "features/rules/context/actions";
import { globalActions } from "store/slices/global/slice";
import "./rulesTable.css";

import { RecordType, RecordStatus, StorageRecord } from "@requestly/shared/types/entities/rules";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { useRBAC } from "features/rbac";

interface Props {
  records: StorageRecord[];
  allRecordsMap: { [id: string]: StorageRecord };
  loading: boolean;
  searchValue: string;
}

const RulesTable: React.FC<Props> = ({ records, loading, searchValue, allRecordsMap }) => {
  const { selectedRows, clearSelectedRows } = useContentListTableContext();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("http_rule", "create");

  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const allRecords = useSelector(getAllRecords);
  const isAppBannerVisible = useSelector(getIsAppBannerVisible);
  const isSampleRulesImported = useSelector(getIsSampleRulesImported);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const [groupIdsToExpand, setGroupIdsToExpand] = useState<string[]>([]);
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
    updateGroupOnDrop,
  } = useRulesActionContext();

  const isRuleExist = allRecords?.length > 0;

  useEffect(() => {
    if (!user.loggedIn) {
      return;
    }

    if (isSampleRulesImported) {
      return;
    }

    if (!isRuleExist) {
      return;
    }

    if (activeWorkspaceId) {
      return;
    }

    importSampleRules(user, appMode).then((groupIdsToExpand: string[]) => {
      if (groupIdsToExpand?.length > 0) {
        setGroupIdsToExpand(groupIdsToExpand);
      }

      trackSampleRulesImported();

      dispatch(globalActions.updateIsSampleRulesImported(true));

      dispatch(
        globalActions.updateRefreshPendingStatus({
          type: "rules",
          newValue: !isRulesListRefreshPending,
        })
      );
    });
  }, [user, appMode, isRuleExist, isSampleRulesImported, activeWorkspaceId, isRulesListRefreshPending, dispatch]);

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
      return allRecordsMap[record.id]?.status === RecordStatus.ACTIVE;
    });

    return isAllRecordsActive ? "Deactivate" : "Activate";
  }, [selectedRows, allRecordsMap]);

  const getTableScrollHeight = () => {
    const featureLimiterBannerHeight = "68px";
    const appBannerHeight = "48px";

    return `calc(100vh - 232px - ${isFeatureLimitbannerShown ? featureLimiterBannerHeight : "0px"} - ${
      isAppBannerVisible ? appBannerHeight : "0px"
    })`;
  };

  const getRowClassNames = (record: RuleTableRecord) => {
    let classNames = "";
    if (isGroup(record)) {
      classNames += "rq-content-list-table-row-group";
    }
    if (record.isFavourite) {
      classNames += " record-pinned";
    }
    return classNames;
  };

  const onRowDropped: ContentListTableProps<RuleTableRecord>["onRowDropped"] = useCallback(
    (sourceRecordId, targetRecordId) => {
      if (!sourceRecordId || !targetRecordId) {
        return;
      }

      const dragRecord = allRecordsMap[sourceRecordId];
      const targetRecord = allRecordsMap[targetRecordId];

      if (dragRecord?.objectType === RecordType.GROUP) {
        return;
      }

      if (dragRecord?.objectType === RecordType.RULE) {
        if (targetRecord?.objectType === RecordType.GROUP) {
          if (dragRecord?.groupId !== targetRecord?.id) {
            updateGroupOnDrop(dragRecord, targetRecord?.id);
          }
        } else if (targetRecord?.objectType === RecordType.RULE) {
          if ((dragRecord?.groupId !== targetRecord?.groupId, dragRecord)) {
            updateGroupOnDrop(dragRecord, targetRecord?.groupId);
          }
        }
      }
    },
    [allRecordsMap, updateGroupOnDrop]
  );

  return (
    <>
      {/* Add Modals Required in Rules List here */}
      <ContentListTable
        dragAndDrop={isValidPermission}
        isRowSelectable={isValidPermission}
        onRowDropped={onRowDropped}
        id="rules-list-table"
        className={`rules-list-table ${!isValidPermission ? "read-only" : ""}`}
        defaultExpandedRowKeys={groupIdsToExpand}
        size="middle"
        scroll={{ y: getTableScrollHeight() }}
        columns={columns}
        data={contentTableData}
        rowKey="id"
        loading={loading}
        customRowClassName={(record) => getRowClassNames(record)}
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
