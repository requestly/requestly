import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Divider, Input, Row, Menu, Dropdown } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getAllGroups, getAppMode, getCurrentlySelectedRuleData, getIsRefreshRulesPending } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { createNewGroup, updateGroupOfSelectedRules } from "components/features/rules/ChangeRuleGroupModal/actions";
import { globalActions } from "store/slices/global/slice";
import GroupMenuItem from "./GroupMenuItem";
import APP_CONSTANTS from "config/constants";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { trackGroupChangedEvent, trackGroupCreatedEvent } from "features/rules/analytics";
import { Group } from "types/rules";
import Logger from "lib/logger";
import { RQButton } from "lib/design-system-v2/components";
import "./EditorGroupDropdown.css";
import clientRuleStorageService from "services/clientStorageService/features/rule";

const { RULE_EDITOR_CONFIG } = APP_CONSTANTS;

interface EditorGroupDropdownProps {
  mode: "create" | "edit";
}

const EditorGroupDropdown: React.FC<EditorGroupDropdownProps> = ({ mode }) => {
  // Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const rule = useSelector(getCurrentlySelectedRuleData);
  const groupList = useSelector(getAllGroups);
  const appMode = useSelector(getAppMode);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);

  // Component State
  const [showInput, setShowInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [modifiedGroups, setModifiedGroups] = useState(groupList ?? []);
  const currentGroupId = rule?.groupId ?? "";

  useEffect(() => {
    Logger.log("Reading storage in EditorGroupDropdown");
    clientRuleStorageService
      .getRecordsByObjectType(GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP)
      .then((groups) => dispatch(globalActions.updateGroups(groups)));
  }, [appMode, dispatch]);

  useEffect(() => {
    if (!showDropdown) return;

    const selectedGroup = groupList.filter((group: Group) => group.id === currentGroupId);

    const remainingGroups = groupList.filter((group: Group) => group.id !== currentGroupId);

    setModifiedGroups(selectedGroup.concat(remainingGroups));
  }, [groupList, currentGroupId, showDropdown]);

  const handleGroupInputNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewGroupName(e.target.value);
  };

  const handleAddNewGroup = () => {
    createNewGroup(
      appMode,
      newGroupName,
      (groupId: string) => {
        handleGroupChange(groupId);
        trackGroupCreatedEvent("rule_editor");
        Logger.log("Reading storage in EditorGroupDropdown handleAddNewGroup");
        clientRuleStorageService
          .getRecordsByObjectType(GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP)
          .then((groups) => dispatch(globalActions.updateGroups(groups)));
      },
      user
    );

    setNewGroupName("");
    setShowInput(false);
  };

  const handleDropdownVisibleChange = (isVisible: boolean) => {
    if (isVisible) {
      setShowInput(false);
      setNewGroupName("");
    }
    setShowDropdown(isVisible);
  };

  const handleGroupChange = (groupId: string) => {
    dispatch(globalActions.updateCurrentlySelectedRuleData({ ...rule, groupId }));

    updateGroupOfSelectedRules(appMode, [rule.id], groupId, user).then(() => {
      dispatch(
        globalActions.updateRefreshPendingStatus({
          type: "rules",
          newValue: !isRulesListRefreshPending,
        })
      );

      trackGroupChangedEvent("rule_editor");
    });

    handleDropdownVisibleChange(false);
  };

  const dropdownOverlay = (
    <Menu className={`editor-group-dropdown-menu ${showInput ? "show-group-input" : ""}`}>
      <div>
        {showInput && (
          <div className="editor-group-dropdown-input-container">
            <div className="text-gray editor-group-input-title">GROUP NAME</div>
            <Input
              autoFocus
              value={newGroupName}
              onChange={handleGroupInputNameChange}
              onPressEnter={handleAddNewGroup}
              placeholder="Enter group name"
              className="editor-group-dropdown-input"
            />

            <Row align="middle">
              <div className="ml-auto editor-group-dropdown-actions">
                <RQButton
                  size="small"
                  onClick={() => setShowDropdown(false)}
                  className="editor-group-dropdown-cancel-btn"
                >
                  Cancel
                </RQButton>
                <RQButton size="small" type="primary" onClick={handleAddNewGroup} disabled={newGroupName.length === 0}>
                  Create
                </RQButton>
              </div>
            </Row>
          </div>
        )}

        {!showInput && (
          <>
            <div>
              <RQButton
                type="transparent"
                icon={<PlusOutlined />}
                onClick={() => setShowInput(true)}
                className="editor-dropdown-add-new-group"
              >
                New group
              </RQButton>

              <div>
                <Divider style={{ margin: "8px 0" }} />
                <div className="text-gray editor-group-list-title">GROUPS</div>
              </div>
            </div>
          </>
        )}
      </div>

      {!showInput && (
        <div className="editor-group-menu-name-container">
          {modifiedGroups.map(({ id, name }: Group) => (
            <GroupMenuItem
              key={id}
              id={id}
              name={name}
              currentGroupId={currentGroupId}
              handleMenuItemClick={() => handleGroupChange(id)}
            />
          ))}
        </div>
      )}

      {!showInput && groupList.length > 0 && (
        <>
          <Divider className="editor-group-menu-divider" />
          <Menu.Item
            danger
            disabled={currentGroupId === APP_CONSTANTS.RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID}
            key="remove from group"
            onClick={() => handleGroupChange(APP_CONSTANTS.RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID)}
            className="editor-group-menu-item"
          >
            Remove from group
          </Menu.Item>
        </>
      )}

      {!showInput && groupList.length === 0 && <p className="editor-group-empty-message">No groups available</p>}
    </Menu>
  );

  return (
    <div className="editor-group-list-container">
      <Dropdown
        destroyPopupOnHide
        trigger={["click"]}
        placement="bottomRight"
        open={showDropdown}
        overlay={dropdownOverlay}
        disabled={mode === RULE_EDITOR_CONFIG.MODES.CREATE}
        onOpenChange={handleDropdownVisibleChange}
        className={`editor-group-dropdown-trigger ${showDropdown ? "editor-group-dropdown-active" : ""}`}
      >
        <RQButton>
          <span>
            {currentGroupId === APP_CONSTANTS.RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID
              ? "Add to group"
              : "Edit group"}
            <img
              style={{ width: "10px", height: "6px" }}
              width={10}
              height={6}
              alt="down arrow"
              src="/assets/icons/downArrow.svg" // TODO: Use react-icons
            />
          </span>
        </RQButton>
      </Dropdown>
    </div>
  );
};

export default EditorGroupDropdown;
