import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Dropdown, MenuProps, Row, Switch, Table, Tooltip } from "antd";
import moment from "moment";
import { ContentTableProps } from "componentsV2/ContentTable/ContentTable";
import { RuleTableDataType } from "../types";
import useRuleTableActions from "./useRuleTableActions";
import { getAllRecordsMap } from "store/features/rules/selectors";
import { RecordStatus, Rule } from "features/rules/types/rules";
import RuleTypeTag from "components/common/RuleTypeTag";
import { UserIcon } from "components/common/UserIcon";
import { getCurrentlyActiveWorkspace, getIsWorkspaceMode } from "store/features/teams/selectors";
import { MdOutlineShare } from "@react-icons/all-files/md/MdOutlineShare";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { RiFileCopy2Line } from "@react-icons/all-files/ri/RiFileCopy2Line";
import { RiEdit2Line } from "@react-icons/all-files/ri/RiEdit2Line";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { RiPushpin2Line } from "@react-icons/all-files/ri/RiPushpin2Line";
import { PremiumFeature } from "features/pricing";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import PATHS from "config/constants/sub/paths";
import { isRule } from "../utils";
import { trackRulesListActionsClicked } from "features/rules/analytics";
import { checkIsRuleGroupDisabled, isGroup } from "../utils/rules";
import { trackRuleToggleAttempted } from "modules/analytics/events/common/rules";

const useRuleTableColumns = (options: Record<string, boolean>) => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const allRecordsMap = useSelector(getAllRecordsMap);
  const {
    handleStatusToggle,
    handleRecordShare,
    handleDuplicateRuleClick,
    handleDeleteRecordClick,
    handleRenameGroupClick,
    handleChangeRuleGroupClick,
    handlePinRecordClick,
    handleUngroupOrDeleteGroupsClick,
  } = useRuleTableActions();

  // const isStatusEnabled = !(options && options.disableStatus);
  const isEditingEnabled = !(options && options.disableEditing);
  // const areActionsEnabled = !(options && options.disableActions);
  // const isFavouritingAllowed = !(options && options.disableFavourites);
  // const isAlertOptionsAllowed = !(options && options.disableAlertActions);

  /**
   * - make rule name clickable and navigate to editor.
   */

  const columns: ContentTableProps<RuleTableDataType>["columns"] = [
    Table.SELECTION_COLUMN,
    {
      title: "",
      key: "pin",
      width: 70,
      render: (record: RuleTableDataType) => {
        const isPinned = record.isFavourite;

        return (
          <Tooltip
            title={isPinned ? `Unpin ${isRule(record) ? "rule" : "group"}` : `Pin ${isRule(record) ? "rule" : "group"}`}
            color="var(--black)"
          >
            <Button
              type="text"
              className={`pin-record-btn ${isPinned ? "pin-record-btn-pinned" : ""}`}
              icon={<RiPushpin2Line className={`${record.isFavourite ? "record-pinned" : "record-unpinned"}`} />}
              onClick={(e) => {
                e.stopPropagation();
                if (isEditingEnabled) {
                  handlePinRecordClick(record);
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
      render: (rule: RuleTableDataType) => {
        return isRule(rule) ? (
          <Link to={`${PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE}/${rule.id}`} state={{ source: "my_rules" }}>
            {rule.name}
          </Link>
        ) : (
          rule.name
        );
      },
      onCell: (record: RuleTableDataType) => {
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
            return a.modificationDate > b.modificationDate ? -1 : 1;
          }
        },
      },
    },
    {
      title: "Type",
      key: "ruleType",
      width: 200,
      onCell: (record: RuleTableDataType) => {
        if (isGroup(record)) {
          return {
            colSpan: 0,
          };
        }
      },
      render: (record: RuleTableDataType) => {
        if (isRule(record)) {
          return <RuleTypeTag ruleType={record.ruleType} />;
        }
      },
    },
    {
      key: "status",
      title: "Status",
      width: 120,
      render: (_, record: RuleTableDataType, index) => {
        const isRecordActive = record.status === RecordStatus.ACTIVE;
        // todo @nsr: check if this check also applies to groups?
        if (isRule(record)) {
          return (
            <PremiumFeature
              disabled={isRecordActive}
              features={[FeatureLimitType.num_active_rules]}
              popoverPlacement="left"
              onContinue={() => handleStatusToggle([record])}
              source="rule_list_status_switch"
              onClickCallback={() => trackRuleToggleAttempted(record.status)}
            >
              <Switch
                size="small"
                checked={isRecordActive}
                disabled={checkIsRuleGroupDisabled(allRecordsMap, record)}
                data-tour-id={index === 0 ? "rule-table-switch-status" : null}
              />
            </PremiumFeature>
          );
        } else {
          return (
            <Switch
              size="small"
              checked={isRecordActive}
              data-tour-id={index === 0 ? "rule-table-switch-status" : null}
              onChange={(checked, e) => {
                e.stopPropagation();
                handleStatusToggle([record]);
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
      render: (record: RuleTableDataType) => {
        if (isGroup(record)) {
          return null;
        }
        const dateToDisplay = record.modificationDate ? record.modificationDate : record.creationDate;
        const beautifiedDate = moment(dateToDisplay).format("MMM DD, YYYY");
        if (currentlyActiveWorkspace?.id && !options?.hideLastModifiedBy) {
          return (
            <span>
              {beautifiedDate} <UserIcon uid={record.lastModifiedBy} />
            </span>
          );
        } else return beautifiedDate;
      },
    },
    {
      title: "",
      key: "actions",
      width: 104,
      align: "right",
      render: (record: RuleTableDataType) => {
        const isRuleRecord = isRule(record);

        const recordActions = ([
          {
            key: 0,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              isRuleRecord ? handleChangeRuleGroupClick(record) : handleRenameGroupClick(record);
            },
            label: (
              <Row>
                {isRuleRecord ? (
                  <>
                    <RiEdit2Line /> Change Group
                  </>
                ) : (
                  <>
                    <RiEdit2Line /> Rename
                  </>
                )}
              </Row>
            ),
          },
          {
            key: 1,
            disabled: !isRuleRecord,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              handleDuplicateRuleClick(record as Rule);
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
              isRuleRecord ? handleDeleteRecordClick(record) : handleUngroupOrDeleteGroupsClick(record);
            },
            label: (
              <Row>
                <RiDeleteBinLine />
                Delete
              </Row>
            ),
          },
        ] as MenuProps["items"]).filter((option) => {
          // @ts-ignore
          return !option.disabled;
        });

        return (
          <Row align="middle" wrap={false} className="rules-actions-container">
            {isRuleRecord ? (
              <Button
                type="text"
                icon={<MdOutlineShare />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRecordShare(record);
                }}
              />
            ) : null}

            <Dropdown menu={{ items: recordActions }} trigger={["click"]} overlayClassName="rule-more-actions-dropdown">
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
      render: (record: RuleTableDataType) => {
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
