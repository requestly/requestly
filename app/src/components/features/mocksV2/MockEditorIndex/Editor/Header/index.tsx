import React, { useState } from "react";
import { Row, Layout, Col, Tooltip, Dropdown, Menu, Button } from "antd";
import { ExperimentOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { RQButton, RQBreadcrumb } from "lib/design-system/components";
import { MockType } from "components/features/mocksV2/types";
import "./index.css";
import { trackMockEditorClosed } from "modules/analytics/events/features/mocksV2";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { useLocation } from "react-router-dom";
import PasswordPopup from "./PasswordPopup/PasswordPopup";

interface HeaderProps {
  isNewMock: boolean;
  mockType: string;
  savingInProgress: boolean;
  handleClose: Function;
  handleSave: Function;
  handleTest: () => void;
  setPassword: (password: string) => void;
  password: string;
}

export const MockEditorHeader: React.FC<HeaderProps> = ({
  isNewMock,
  mockType,
  savingInProgress,
  handleClose,
  handleSave,
  handleTest,
  setPassword,
  password,
}) => {
  const location = useLocation();

  // Component State
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdownVisibleChange = (isVisible: boolean) => {
    if (!isVisible) {
      setShowPasswordPopup(false);
    }
    setShowDropdown(isVisible);
  };

  const dropdownOverlay = (
    <Menu>
      <div>
        {showPasswordPopup && (
          <PasswordPopup setPassword={setPassword} password={password} setVisible={handleDropdownVisibleChange} />
        )}

        {!showPasswordPopup && (
          <>
            <div>
              <Button
                type="text"
                icon={password.length > 0 ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => setShowPasswordPopup(true)}
              >
                {password.length > 0 ? "Update Password" : "Add Password"}
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
