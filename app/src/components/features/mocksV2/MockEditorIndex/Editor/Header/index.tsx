import React, { useState } from "react";
import { Row, Layout, Col, Tooltip, Dropdown, Menu, Input, Button } from "antd";
import { ExperimentOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { RQButton, RQBreadcrumb } from "lib/design-system/components";
import { MockType } from "components/features/mocksV2/types";
import "./index.css";
import { trackMockEditorClosed } from "modules/analytics/events/features/mocksV2";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  isNewMock: boolean;
  mockType: string;
  savingInProgress: boolean;
  handleClose: Function;
  handleSave: Function;
  handleTest: () => void;
}

export const MockEditorHeader: React.FC<HeaderProps> = ({
  isNewMock,
  mockType,
  savingInProgress,
  handleClose,
  handleSave,
  handleTest,
}) => {
  const location = useLocation();

  const getRulePassword = (): string => {
    // Replace with actual implemention to fetch existing password
    return localStorage.getItem("rq-password") ?? "";
  };

  // Component State
  const [showInput, setShowInput] = useState(false);
  const [rulePassword, setRulePassword] = useState(getRulePassword());
  const [showDropdown, setShowDropdown] = useState(false);

  const handleRulePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRulePassword(e.target.value);
  };

  const handleDropdownVisibleChange = (isVisible: boolean) => {
    if (isVisible) {
      setShowInput(false);
    }
    setShowDropdown(isVisible);
  };

  const handleUpdatePassword = () => {
    // Replace with actual implemention to save password
    localStorage.setItem("rq-password", rulePassword);

    setShowDropdown(false);
  };

  const handlePasswordDelete = () => {
    // Replace with actual implemention to save password
    localStorage.removeItem("rq-password");

    setRulePassword("");
    setShowDropdown(false);
  };

  const dropdownOverlay = (
    <Menu className={`editor-group-dropdown-menu ${showInput ? "show-group-input" : ""}`}>
      <div>
        {showInput && (
          <div className="editor-group-dropdown-input-container">
            <div className="text-gray editor-group-input-title">PASSWORD</div>
            <Input
              autoFocus
              value={rulePassword}
              onChange={handleRulePasswordInputChange}
              onPressEnter={handleUpdatePassword}
              placeholder="Enter rule password"
              className="editor-group-dropdown-input"
            />

            <Row align="middle">
              <div className="ml-auto editor-group-dropdown-actions">
                <Button size="small" onClick={handlePasswordDelete} className="editor-group-dropdown-cancel-btn">
                  Delete
                </Button>
                <Button
                  ghost
                  size="small"
                  type="primary"
                  onClick={handleUpdatePassword}
                  disabled={rulePassword.length === 0}
                >
                  Save
                </Button>
              </div>
            </Row>
          </div>
        )}

        {!showInput && (
          <>
            <div>
              <Button
                type="text"
                icon={rulePassword.length > 0 ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => setShowInput(true)}
                className="editor-dropdown-add-new-group"
              >
                {rulePassword.length > 0 ? "Update Password" : "Add Password"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Menu>
  );

  return (
    <Layout.Header className="mock-editor-layout-header">
      <Row className="w-full">
        <Col span={4} className="header-left-section">
          <Tooltip title={`Back to ${mockType === MockType.API ? "mocks" : "files"}`} placement="bottom">
            <RQButton
              iconOnly
              type="text"
              icon={<img alt="back" width="14px" height="12px" src="/assets/icons/leftArrow.svg" />}
              onClick={() => {
                trackMockEditorClosed(mockType, "back_button");
                handleClose();
              }}
            />
          </Tooltip>
          {!location.pathname.includes("rules") && <RQBreadcrumb />}
        </Col>
        <Col className="header-right-section">
          <div className="mock-edtior-options-container">
            <Dropdown
              destroyPopupOnHide
              trigger={["click"]}
              open={showDropdown}
              placement="bottomRight"
              overlay={dropdownOverlay}
              onOpenChange={handleDropdownVisibleChange}
              className={`mock-editor-options-dropdown-trigger ${
                showDropdown ? "mock-editor-options-dropdown-active" : ""
              }`}
            >
              <span className="text-gray">
                More
                <img
                  width={10}
                  height={6}
                  alt="down arrow"
                  src="/assets/icons/downArrow.svg"
                  className="mock-editor-options-trigger-icon"
                />
              </span>
            </Dropdown>
          </div>
          {!isNewMock && isFeatureCompatible(FEATURES.API_CLIENT) && (
            <RQButton type="default" icon={<ExperimentOutlined />} onClick={handleTest}>
              Test
            </RQButton>
          )}
          <RQButton
            type="default"
            onClick={() => {
              trackMockEditorClosed(mockType, "cancel_button");
              handleClose();
            }}
          >
            Cancel
          </RQButton>
          <RQButton type="primary" loading={savingInProgress} disabled={savingInProgress} onClick={() => handleSave()}>
            {isNewMock ? (savingInProgress ? "Creating" : "Create") : savingInProgress ? "Saving" : "Save"}
          </RQButton>
        </Col>
      </Row>
    </Layout.Header>
  );
};
