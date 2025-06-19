import React, { useState } from "react";
import { Row, Layout, Col, Tooltip, Dropdown, Menu, Button } from "antd";
import { ExperimentOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { RQBreadcrumb, RQButton } from "lib/design-system-v2/components";
import { MockType } from "components/features/mocksV2/types";
import "./index.css";
import { trackMockEditorClosed, trackMockPasswordGenerateClicked } from "modules/analytics/events/features/mocksV2";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { useLocation } from "react-router-dom";
import PasswordPopup from "./PasswordPopup/PasswordPopup";
import { Conditional } from "components/common/Conditional";
import { RBACButton } from "features/rbac";
import { KEYBOARD_SHORTCUTS } from "../../../../../../constants/keyboardShortcuts";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";

interface HeaderProps {
  isNewMock: boolean;
  mockType: string;
  savingInProgress: boolean;
  handleClose: Function;
  handleSave: () => void;
  handleTest: () => void;
  setPassword: (password: string) => void;
  password: string;
  isEditorReadOnly: boolean;
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
  isEditorReadOnly,
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
                icon={password?.length > 0 ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => {
                  trackMockPasswordGenerateClicked(password?.length > 0);
                  setShowPasswordPopup(true);
                }}
              >
                {password?.length > 0 ? "Update Password" : "Add Password"}
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
              type="transparent"
              icon={<img alt="back" width="14px" height="12px" src="/assets/media/common/left-arrow.svg" />}
              onClick={() => {
                trackMockEditorClosed(mockType, "back_button");
                handleClose();
              }}
            />
          </Tooltip>
          <Conditional condition={!location.pathname.includes("rules")}>
            <RQBreadcrumb />
          </Conditional>
        </Col>
        <Col className="header-right-section">
          <Conditional condition={!isEditorReadOnly}>
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
                <RQButton>
                  More
                  <MdOutlineKeyboardArrowDown />
                </RQButton>
              </Dropdown>
            </div>
          </Conditional>

          {!isNewMock && isFeatureCompatible(FEATURES.API_CLIENT) && (
            <RQButton
              icon={<ExperimentOutlined />}
              onClick={handleTest}
              type={isEditorReadOnly ? "primary" : "secondary"}
            >
              Test
            </RQButton>
          )}
          <RQButton
            type="secondary"
            onClick={() => {
              trackMockEditorClosed(mockType, "cancel_button");
              handleClose();
            }}
          >
            Cancel
          </RQButton>

          <RBACButton
            permission="create"
            resource="mock_api"
            type="primary"
            showHotKeyText
            hotKey={KEYBOARD_SHORTCUTS.FILE_SERVER.SAVE_FILE.hotKey}
            loading={savingInProgress}
            onClick={handleSave}
            tooltipTitle="Saving is not allowed in view-only mode. You can test mocks but cannot save them."
          >
            {isNewMock ? (savingInProgress ? "Creating" : "Create") : savingInProgress ? "Saving" : "Save"}
          </RBACButton>
        </Col>
      </Row>
    </Layout.Header>
  );
};
