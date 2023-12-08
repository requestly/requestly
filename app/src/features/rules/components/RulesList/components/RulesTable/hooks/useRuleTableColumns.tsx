import { useSelector } from "react-redux";
import { Button, Dropdown, MenuProps, Row, Switch, Table, Tooltip } from "antd";
import moment from "moment";
import { ContentTableProps } from "componentsV2/ContentTable/ContentTable";
import { RuleTableDataType } from "../types";
import useRuleTableActions from "./useRuleTableActions";
import { RuleObjStatus, RuleObjType } from "features/rules/types/rules";
import RuleTypeTag from "components/common/RuleTypeTag";
import { UserIcon } from "components/common/UserIcon";
import { getCurrentlyActiveWorkspace, getIsWorkspaceMode } from "store/features/teams/selectors";
import { MdOutlineShare } from "@react-icons/all-files/md/MdOutlineShare";
import { MdOutlineMoreHoriz } from "@react-icons/all-files/md/MdOutlineMoreHoriz";
import { RiFileCopy2Line } from "@react-icons/all-files/ri/RiFileCopy2Line";
import { RiEdit2Line } from "@react-icons/all-files/ri/RiEdit2Line";
import { RiDeleteBinLine } from "@react-icons/all-files/ri/RiDeleteBinLine";
import { RiPushpin2Line } from "@react-icons/all-files/ri/RiPushpin2Line";

const useRuleTableColumns = (options: Record<string, boolean>) => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const {
    handleStatusToggle,
    handleRuleShare,
    handleDuplicateRuleClick,
    handleDeleteRecordClick,
    handleRenameGroupClick,
    handleChangeRuleGroupClick,
    handlePinRecordClick,
    handleUngroupOrDeleteRulesClick,
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
      width: 54,
      render: (record: RuleTableDataType) => {
        const isPinned = record.isFavourite;

        return (
          <Tooltip title={isPinned ? "Unpin Record" : "Pin Record"}>
            <Button
              type="text"
              className="pin-record-btn"
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
      width: 376,
      ellipsis: true,
      render: (rule: RuleTableDataType) => rule.name,
      onCell: (rule: RuleTableDataType) => {
        if (rule.objectType === "group") {
          return {
            colSpan: 2,
          };
        }
      },
      defaultSortOrder: "ascend",
      sorter: {
        // Fix. Descend logic sending groups to bottom
        // Fix: Default/No sort logic. Group should stay at top
        compare: (a, b) => {
          if (a.objectType === "group" && b.objectType !== "group") {
            return -1;
          } else if (a.objectType !== "group" && b.objectType === "group") {
            return 1;
          } else {
            return a.name?.toLowerCase() > b.name?.toLowerCase() ? 1 : -1;
          }
        },
      },
    },
    {
      title: "Type",
      key: "ruleType",
      width: 200,
      onCell: (rule: RuleTableDataType) => {
        if (rule.objectType && rule.objectType === "group") {
          return {
            colSpan: 0,
          };
        }
      },
      render: (rule: RuleTableDataType) => {
        if (rule.objectType && rule.objectType !== RuleObjType.GROUP) {
          return <RuleTypeTag ruleType={rule.ruleType} />;
        }
      },
    },
    {
      key: "status",
      title: "Status",
      width: 120,
      render: (rule: RuleTableDataType) => {
        const checked = rule?.status === RuleObjStatus.ACTIVE ? true : false;
        return (
          <Switch
            size="small"
            checked={checked}
            onChange={(checked: boolean, e) => {
              e.stopPropagation();
              handleStatusToggle([rule], checked);
            }}
          />
        );
      },
    },
    {
      title: "Updated on",
      key: "modificationDate",
      align: "center",
      width: 152,
      responsive: ["lg"],
      render: (rule: RuleTableDataType) => {
        if (rule.objectType && rule.objectType === RuleObjType.GROUP) {
          return null;
        }
        const dateToDisplay = rule.modificationDate ? rule.modificationDate : rule.creationDate;
        const beautifiedDate = moment(dateToDisplay).format("MMM DD, YYYY");
        if (currentlyActiveWorkspace?.id && !options?.hideLastModifiedBy) {
          return (
            <span>
              {beautifiedDate} by <UserIcon uid={rule.lastModifiedBy} />
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
        const isRule = record.objectType === RuleObjType.RULE;

        const recordActions = ([
          {
            key: 0,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              isRule ? handleChangeRuleGroupClick(record) : handleRenameGroupClick(record);
            },
            label: (
              <Row>
                {isRule ? (
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
            disabled: !isRule,
            onClick: (info) => {
              info.domEvent?.stopPropagation?.();
              handleDuplicateRuleClick(record);
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
              isRule ? handleDeleteRecordClick(record) : handleUngroupOrDeleteRulesClick(record);
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
            {isRule ? (
              <Button
                type="text"
                icon={<MdOutlineShare />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRuleShare(record);
                }}
              />
            ) : null}

            <Dropdown menu={{ items: recordActions }} trigger={["click"]} overlayClassName="rule-more-actions-dropdown">
              <Button
                type="text"
                className="more-rule-actions-btn"
                icon={<MdOutlineMoreHoriz />}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </Row>
        );
      },
    },
  ];

  // FIXME: Extend the column type to also support custom fields eg hidden property to hide the column
  if (isWorkspaceMode && !options.hideCreatedBy) {
    columns.splice(3, 0, {
      title: "Author",
      width: 96,
      responsive: ["lg"],
      key: "createdBy",
      render: (rule: RuleTableDataType) => {
        if (rule.objectType && rule.objectType === RuleObjType.GROUP) {
          return null;
        }
        const uid = rule.createdBy ?? null;
        return currentlyActiveWorkspace?.id ? <UserIcon uid={uid} /> : null;
      },
    });
  }

  return columns;
};

export default useRuleTableColumns;
