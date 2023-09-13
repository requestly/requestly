import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Divider, Dropdown, Menu } from "antd";
import DuplicateButton from "../ActionButtons/DuplicateButton";
import DeleteButton from "../ActionButtons/DeleteButton";
import APP_CONSTANTS from "config/constants";
import "./RuleOptions.css";

const RuleOptions = ({ mode, rule }) => {
  const navigate = useNavigate();
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const isDisabled = mode === "create";

  const handleRuleOptionsDropdownClose = () => {
    setIsOptionsVisible(false);
  };

  const ruleOptionMenu = (
    <Menu className="editor-rule-options-menu">
      <Menu.Item key="0" disabled={isDisabled} className="editor-rule-options-menu-item">
        <DuplicateButton
          rule={rule}
          isDisabled={isDisabled}
          handleRuleOptionsDropdownClose={handleRuleOptionsDropdownClose}
        />
      </Menu.Item>
      <Menu.Item
        key="1"
        disabled={isDisabled}
        className="editor-rule-options-menu-item"
        onClick={handleRuleOptionsDropdownClose}
      ></Menu.Item>
      <Divider className="editor-rule-options-menu-divider" />
      <Menu.Item
        key="2"
        disabled={isDisabled}
        className="editor-rule-options-menu-item editor-rule-options-danger-menu-item"
        onClick={handleRuleOptionsDropdownClose}
      >
        <DeleteButton
          rule={rule}
          isDisabled={isDisabled}
          ruleDeletedCallback={() => navigate(APP_CONSTANTS.PATHS.RULES.MY_RULES.ABSOLUTE)}
        />
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown
      trigger={["click"]}
      open={isOptionsVisible}
      onOpenChange={setIsOptionsVisible}
      placement="bottomRight"
      overlay={ruleOptionMenu}
      className={`editor-rule-options-trigger ${isOptionsVisible ? "editor-rule-options-active" : ""}`}
    >
      <span className="text-gray">
        More
        <img
          width={10}
          height={6}
          alt="down arrow"
          src="/assets/icons/downArrow.svg"
          className="editor-rule-options-trigger-icon"
        />
      </span>
    </Dropdown>
  );
};

export default RuleOptions;
