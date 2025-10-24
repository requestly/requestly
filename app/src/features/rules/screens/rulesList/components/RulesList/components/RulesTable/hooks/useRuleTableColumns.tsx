import { useSelector } from "react-redux";
import { Button, Dropdown, MenuProps, Row, Switch, Table, Tooltip, Popconfirm } from "antd";
import moment from "moment";
import { ContentListTableProps } from "componentsV2/ContentList";
import { RuleTableRecord } from "../types";
import { getAllRecordsMap } from "store/features/rules/selectors";
import { Group, RecordStatus, Rule } from "@requestly/shared/types/entities/rules";
import RuleTypeTag from "components/common/RuleTypeTag";
import { UserAvatar } from "componentsV2/UserAvatar";
import { MdOutlineShare } from "@react-icons/all-files/md/MdOutlineShare";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { RiFileCopy2Line } from "@react-icons/all-files/ri/RiFileCopy2Line";
import { RiEdit2Line } from "@react-icons/all-files/ri/RiEdit2Line";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { PremiumFeature } from "features/pricing";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { isRule, isGroup } from "features/rules/utils";
import { trackRulesListActionsClicked } from "features/rules/analytics";
import { checkIsRuleGroupDisabled, normalizeRecord } from "../utils/rules";
import { trackRuleToggleAttempted } from "modules/analytics/events/common/rules";
import { PREMIUM_RULE_TYPES } from "features/rules/constants";
import APP_CONSTANTS from "config/constants";
import { useRulesActionContext } from "features/rules/context/actions";
import { MdOutlinePushPin } from "@react-icons/all-files/md/MdOutlinePushPin";
import { WarningOutlined } from "@ant-design/icons";
import { ImUngroup } from "@react-icons/all-files/im/ImUngroup";
import RuleNameColumn from "../components/RulesColumn/RulesColumn";
import { getActiveWorkspaceId, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { RoleBasedComponent } from "features/rbac";

const useRuleTableColumns = (options: Record<string, boolean>) => {
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const allRecordsMap = useSelector(getAllRecordsMap);
  const {
    recordsChangeGroupAction,
    recordsShareAction,
    recordsDeleteAction,
    recordStatusToggleAction,
    recordDuplicateAction,
    recordRenameAction,
    groupDeleteAction,
    recordsPinAction,
    groupShareAction,
    recordsUngroupAction,
  } = useRulesActionContext();
  const isEditingEnabled = !(options && options.disableEditing);

  const columns: ContentListTableProps<RuleTableRecord>["columns"] = [
    Table.SELECTION_COLUMN,
    {
      title: "",
      key: "pin",
      width: 70,
      render: (_value, record: RuleTableRecord) => {
        const isPinned = record.isFavourite;

        return (
          <Tooltip
            title={
              isPinned
                ? `Unpin ${isRule(record) ? "rule from extension popup" : "group from extension popup"}`
                : `Pin ${isRule(record) ? "rule to extension popup" : "group to extension popup"}`
            }
            color="var(--requestly-color-black)"
          >
            <Button
              type="text"
              className={`pin-record-btn ${isPinned ? "pin-record-btn-pinned" : ""}`}
              icon={<MdOutlinePushPin className={`${record.isFavourite ? "record-pinned" : "record-unpinned"}`} />}
              onClick={(e) => {
                e.stopPropagation();
                if (isEditingEnabled) {
                  recordsPinAction([normalizeRecord(record)]);
                }
              }}
            />
          </Tooltip>
        );
      },
    },
    Table.EXPAND_COLUMN,
    {
      title: "Rules",
      key: "name",
      width: isSharedWorkspaceMode ? 322 : 376,
      ellipsis: true,
      render: (record: RuleTableRecord) => {
        return <RuleNameColumn record={record} />;
      },
      onCell: (record: RuleTableRecord) => {
        if (isGroup(record)) {
          return {
            colSpan: 2,
          };
        }
      },
      defaultSortOrder: "ascend",
      sortDirections: ["ascend", "descend", "ascend"],
      showSorterTooltip: false,
      sorter: {
        // Sample group always at the top
        compare: (a, b) => {
          if (isGroup(a) && a.isSample && (!isGroup(b) || !b.isSample)) {
            return -1;
          }
          if (isGroup(b) && b.isSample && (!isGroup(a) || !a.isSample)) {
            return 1;
          }

          // Non-sample groups next
          if (isGroup(a) && !isGroup(b)) {
            return -1;
          }
          if (!isGroup(a) && isGroup(b)) {
            return 1;
          }

          // Sort by name for items of the same type
          return a.name?.toLowerCase()?.localeCompare(b.name?.toLowerCase());
        },
      },
    },
    {
      title: "Type",
      key: "ruleType",
      width: 200,
      onCell: (record: RuleTableRecord) => {
        if (isGroup(record)) {
          return {
            colSpan: 0,
          };
        }
      },
      render: (record: RuleTableRecord) => {
        if (isRule(record)) {
          return <RuleTypeTag ruleType={record.ruleType} />;
        }
      },
      sortDirections: ["ascend", "descend", "ascend"],
      showSorterTooltip: false,
      sorter: {
        compare: (a, b) => {
          if (isGroup(a) && !isGroup(b)) {
            return -1;
          } else if (!isGroup(a) && isGroup(b)) {
            return 1;
          } else if (isGroup(a) && isGroup(b)) {
            return 0;
          } else {
            if (isGroup(a) || isGroup(b)) {
              return 0;
            }
            return a.ruleType.toLowerCase()?.localeCompare(b.ruleType.toLowerCase());
          }
        },
      },
    },
    {
      key: "status",
      title: "Status",
      width: 120,
      render: (_, record: RuleTableRecord, index) => {
        if (isRule(record)) {
          const isRuleGroupDisabled = checkIsRuleGroupDisabled(allRecordsMap, record);
          if (isRuleGroupDisabled) {
            return (
              <Popconfirm
                title={
                  <>
                    <Row className="group-disabled-popover-title">{"Enable parent group"}</Row>
                    <Row className="group-disabled-popover-content">
                      This rule won't execute because its parent group is disabled. Enable the group to activate this
                      rule.
                    </Row>
                  </>
                }
                overlayClassName="group-disabled-popover"
                trigger={["hover", "focus"]}
                okText="Enable"
                cancelText="Cancel"
                icon={<WarningOutlined />}
                onConfirm={() => recordStatusToggleAction(normalizeRecord(allRecordsMap[record.groupId]))}
              >
                <Switch
                  size="small"
                  checked={record.status === RecordStatus.ACTIVE}
                  data-tour-id={index === 0 ? "rule-table-switch-status" : null}
                  onChange={() => recordStatusToggleAction(normalizeRecord(record))}
                />
                {record.status === RecordStatus.ACTIVE && <WarningOutlined className="group-disabled-warning" />}
              </Popconfirm>
            );
          } else {
            return (
              <PremiumFeature
                disabled={record.status === RecordStatus.ACTIVE || record.isSample}
                features={
                  PREMIUM_RULE_TYPES.includes(record.ruleType)
                    ? [FeatureLimitType.num_active_rules, FeatureLimitType.response_rule]
                    : [FeatureLimitType.num_active_rules]
                }
                featureName={`${APP_CONSTANTS.RULE_TYPES_CONFIG[record.ruleType as any]?.NAME} rule`}
                popoverPlacement="left"
                onContinue={() => recordStatusToggleAction(normalizeRecord(record))}
                source="rule_list_status_switch"
                onClickCallback={() => trackRuleToggleAttempted(record.status)}
              >
                <Switch
                  size="small"
                  checked={record.status === RecordStatus.ACTIVE}
                  data-tour-id={index === 0 ? "rule-table-switch-status" : null}
                />
              </PremiumFeature>
            );
          }
        } else {
          return (
            <Switch
              size="small"
              checked={record.status === RecordStatus.ACTIVE}
              data-tour-id={index === 0 ? "rule-table-switch-status" : null}
              onChange={(checked, e) => {
                e.stopPropagation();
                recordStatusToggleAction(normalizeRecord(record));
              }}
            />
          );
        }
      },
    },
    {
      title: "Updated on",
      key: "modificationDate",
      width: 152,
      responsive: ["lg"],
      render: (record: RuleTableRecord) => {
        if (isGroup(record)) {
          return null;
        }
        const dateToDisplay = record.modificationDate ? record.modificationDate : record.creationDate;
        const beautifiedDate = moment(dateToDisplay).format("MMM DD, YYYY");
        if (activeWorkspaceId && !options?.hideLastModifiedBy) {
          return (
            <span className="rule-updated-on-cell">
              {beautifiedDate} <UserAvatar uid={record.lastModifiedBy} />
            </span>
          );
        } else return <span className="rule-updated-on-cell">{beautifiedDate}</span>;
      },
      defaultSortOrder: "ascend",
      sortDirections: ["ascend", "descend", "ascend"],
      showSorterTooltip: false,
      sorter: {
        compare: (a, b) => {
          const recordAModificationDate = a.modificationDate ? a.modificationDate : a.creationDate;
          const recordBModificationDate = b.modificationDate ? b.modificationDate : b.creationDate;

          if (isGroup(a) && !isGroup(b)) {
            return -1;
          } else if (!isGroup(a) && isGroup(b)) {
            return 1;
          } else {
            return recordAModificationDate < recordBModificationDate ? -1 : 1;
          }
        },
      },
    },
    {
      title: "",
      key: "actions",
      width: 104,
      align: "right",
      render: (record: RuleTableRecord) => {
        const groupActions: MenuProps["items"] = [
          {
            key: 0,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              recordRenameAction(normalizeRecord(record));
            },
            label: (
              <Row>
                <>
                  <RiEdit2Line /> Rename
                </>
              </Row>
            ),
          },
          {
            key: 1,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              groupShareAction(record as Group);
            },
            label: (
              <Row>
                <MdOutlineShare /> Share
              </Row>
            ),
          },
          {
            key: 2,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              recordDuplicateAction(normalizeRecord(record));
            },
            label: (
              <Row>
                <RiFileCopy2Line />
                Duplicate
              </Row>
            ),
          },
          {
            key: 3,
            danger: true,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              groupDeleteAction(record as Group);
            },
            label: (
              <Row>
                <RiDeleteBinLine />
                Delete
              </Row>
            ),
          },
        ];

        const ruleActions: MenuProps["items"] = [
          isRule(record) && !record.isSample && record.groupId
            ? {
                key: 0,
                onClick: (info) => {
                  info.domEvent?.stopPropagation?.();
                  recordsUngroupAction([normalizeRecord(record)]);
                },
                label: (
                  <Row>
                    <ImUngroup />
                    Ungroup
                  </Row>
                ),
              }
            : null,
          {
            key: 1,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              recordsChangeGroupAction([normalizeRecord(record)]);
            },
            label: (
              <Row>
                <RiEdit2Line /> Change Group
              </Row>
            ),
          },
          {
            key: 2,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              recordDuplicateAction(normalizeRecord(record) as Rule);
            },
            label: (
              <Row>
                <RiFileCopy2Line />
                Duplicate
              </Row>
            ),
          },
          {
            key: 3,
            danger: true,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              recordsDeleteAction([normalizeRecord(record)]);
            },
            label: (
              <Row>
                <RiDeleteBinLine />
                Delete
              </Row>
            ),
          },
        ];
        return (
          <RoleBasedComponent resource="http_rule" permission="create">
            <Row align="middle" wrap={false} className="rules-actions-container">
              {isRule(record) ? (
                <Button
                  type="text"
                  icon={<MdOutlineShare />}
                  onClick={(e) => {
                    e.stopPropagation();
                    recordsShareAction([normalizeRecord(record)]);
                  }}
                />
              ) : null}

              <Dropdown
                menu={{ items: isRule(record) ? ruleActions : groupActions }}
                trigger={["click"]}
                overlayClassName="rule-more-actions-dropdown"
              >
                <Button
                  type="text"
                  className="more-rule-actions-btn"
                  icon={<MdOutlineMoreHoriz />}
                  onClick={(e) => {
                    e.stopPropagation();
                    trackRulesListActionsClicked(record.objectType);
                  }}
                />
              </Dropdown>
            </Row>
          </RoleBasedComponent>
        );
      },
    },
  ];

  // FIXME: Extend the column type to also support custom fields eg hidden property to hide the column
  if (isSharedWorkspaceMode && !options.hideCreatedBy) {
    columns.splice(6, 0, {
      title: "Author",
      width: 92,
      responsive: ["lg"],
      key: "createdBy",
      render: (record: RuleTableRecord) => {
        if (isGroup(record)) {
          return null;
        }
        const uid = record.createdBy ?? null;
        return activeWorkspaceId ? <UserAvatar uid={uid} /> : null;
      },
    });
  }

  return columns;
};

export default useRuleTableColumns;
