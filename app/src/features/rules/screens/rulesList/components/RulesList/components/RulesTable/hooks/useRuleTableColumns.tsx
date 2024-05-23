import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Dropdown, MenuProps, Progress, Row, Switch, Table, Tooltip } from "antd";
import moment from "moment";
import { ContentListTableProps } from "componentsV2/ContentList";
import { RuleTableRecord } from "../types";
import { getAllRecordsMap } from "store/features/rules/selectors";
import { Group, RecordStatus, Rule } from "features/rules/types/rules";
import RuleTypeTag from "components/common/RuleTypeTag";
import { UserIcon } from "components/common/UserIcon";
import { getCurrentlyActiveWorkspace, getIsWorkspaceMode } from "store/features/teams/selectors";
import { MdOutlineShare } from "@react-icons/all-files/md/MdOutlineShare";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { RiFileCopy2Line } from "@react-icons/all-files/ri/RiFileCopy2Line";
import { RiEdit2Line } from "@react-icons/all-files/ri/RiEdit2Line";
import { RiInformationLine } from "@react-icons/all-files/ri/RiInformationLine";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { PremiumFeature } from "features/pricing";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import PATHS from "config/constants/sub/paths";
import { isRule, isGroup } from "features/rules/utils";
import { trackRulesListActionsClicked } from "features/rules/analytics";
import { checkIsRuleGroupDisabled, normalizeRecord } from "../utils/rules";
import { trackNewRuleButtonClicked, trackRuleToggleAttempted } from "modules/analytics/events/common/rules";
import { PREMIUM_RULE_TYPES } from "features/rules/constants";
import APP_CONSTANTS from "config/constants";
import { useRulesActionContext } from "features/rules/context/actions";
import { SOURCE } from "modules/analytics/events/common/constants";
import { RuleTypesDropdownWrapper } from "../../RuleTypesDropdownWrapper/RuleTypesDropdownWrapper";
import { MdOutlinePushPin } from "@react-icons/all-files/md/MdOutlinePushPin";
import { useTheme } from "styled-components";

const useRuleTableColumns = (options: Record<string, boolean>) => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
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
  } = useRulesActionContext();
  const isEditingEnabled = !(options && options.disableEditing);

  const theme = useTheme();

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
            title={isPinned ? `Unpin ${isRule(record) ? "rule" : "group"}` : `Pin ${isRule(record) ? "rule" : "group"}`}
            color="var(--black)"
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
      width: isWorkspaceMode ? 322 : 376,
      ellipsis: true,
      render: (record: RuleTableRecord) => {
        if (isRule(record)) {
          return (
            <div className="rule-name-container">
              <Link
                className="rule-name"
                to={`${PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE}/${record.id}`}
                state={{ source: "my_rules" }}
              >
                {record.name}
              </Link>

              {record?.description ? (
                <Tooltip title={record?.description} placement="right" showArrow={false}>
                  <span className="rule-description-icon">
                    <RiInformationLine />
                  </span>
                </Tooltip>
              ) : null}
            </div>
          );
        } else {
          const group = record;
          const totalRules = group.children?.length ?? 0;

          const activeRulesCount = (group.children || []).reduce((count, rule) => {
            return count + (rule.status === RecordStatus.ACTIVE ? 1 : 0);
          }, 0);

          return (
            <div className="group-name-container">
              <div className="group-name">{group.name}</div>

              {totalRules > 0 ? (
                <Tooltip
                  placement="top"
                  title={
                    <>
                      <div>Active rules: {activeRulesCount}</div>
                      <div>Total rules: {totalRules}</div>
                    </>
                  }
                >
                  <div className="group-rules-count-details">
                    <Progress
                      strokeWidth={16}
                      strokeColor={theme?.colors?.success}
                      showInfo={false}
                      type="circle"
                      percent={(activeRulesCount / totalRules) * 100}
                      size="small"
                    />
                    {activeRulesCount} / {totalRules}
                  </div>
                </Tooltip>
              ) : null}

              <RuleTypesDropdownWrapper groupId={group.id} analyticEventSource={SOURCE.RULE_GROUP}>
                <Button
                  className="add-rule-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackNewRuleButtonClicked(SOURCE.RULE_GROUP);
                  }}
                >
                  <span>+</span> <span>Add rule</span>
                </Button>
              </RuleTypesDropdownWrapper>
            </div>
          );
        }
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
        // Fix. Descend logic sending groups to bottom
        // Fix: Default/No sort logic. Group should stay at top
        compare: (a, b) => {
          if (isGroup(a) && !isGroup(b)) {
            return -1;
          } else if (!isGroup(a) && isGroup(b)) {
            return 1;
          } else {
            return a.name?.toLowerCase()?.localeCompare(b.name?.toLowerCase());
          }
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
              <Tooltip
                title={isRuleGroupDisabled ? "Please enable the group to enable/disable the rules inside them." : null}
              >
                <Switch
                  disabled
                  size="small"
                  checked={record.status === RecordStatus.ACTIVE}
                  data-tour-id={index === 0 ? "rule-table-switch-status" : null}
                />
              </Tooltip>
            );
          } else {
            return (
              <PremiumFeature
                disabled={record.status === RecordStatus.ACTIVE}
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
      align: "center",
      width: 152,
      responsive: ["lg"],
      render: (record: RuleTableRecord) => {
        if (isGroup(record)) {
          return null;
        }
        const dateToDisplay = record.modificationDate ? record.modificationDate : record.creationDate;
        const beautifiedDate = moment(dateToDisplay).format("MMM DD, YYYY");
        if (currentlyActiveWorkspace?.id && !options?.hideLastModifiedBy) {
          return (
            <span className="rule-updated-on-cell">
              {beautifiedDate} <UserIcon uid={record.lastModifiedBy} />
            </span>
          );
        } else return beautifiedDate;
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
            danger: true,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              groupDeleteAction(normalizeRecord(record) as Group);
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
          {
            key: 0,
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
            key: 1,
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
            key: 2,
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
        );
      },
    },
  ];

  // FIXME: Extend the column type to also support custom fields eg hidden property to hide the column
  if (isWorkspaceMode && !options.hideCreatedBy) {
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
        return currentlyActiveWorkspace?.id ? <UserIcon uid={uid} /> : null;
      },
    });
  }

  return columns;
};

export default useRuleTableColumns;
