import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Layout, Col, Tooltip } from "antd";
import { ExperimentOutlined } from "@ant-design/icons";
import { RQButton, RQBreadcrumb } from "lib/design-system/components";
import { MockType } from "components/features/mocksV2/types";
import { redirectToFileMocksList, redirectToMocksList } from "utils/RedirectionUtils";
import "./index.css";
import { trackMockEditorClosed } from "modules/analytics/events/features/mocksV2";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

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
  const navigate = useNavigate();

  const handleCloseEditor = () => {
    trackMockEditorClosed(mockType, "back_button");
    if (mockType === MockType.API) {
      redirectToMocksList(navigate);
    } else {
      redirectToFileMocksList(navigate);
    }
  };

  return (
    <Layout.Header className="mock-editor-layout-header">
      <Row className="w-full">
        <Col span={4} className="header-left-section">
          <Tooltip title={`Back to ${mockType === MockType.API ? "mocks" : "files"}`} placement="bottom">
            <RQButton
              iconOnly
              type="text"
              icon={<img alt="back" width="14px" height="12px" src="/assets/icons/leftArrow.svg" />}
              onClick={handleCloseEditor}
            />
          </Tooltip>
          <RQBreadcrumb />
        </Col>
        <Col className="header-right-section">
          {!isNewMock && isFeatureCompatible(FEATURES.API_CLIENT) && (
            <RQButton type="default" icon={<ExperimentOutlined />} onClick={handleTest}>
              Test
            </RQButton>
          )}
          <RQButton type="default" onClick={() => handleClose()}>
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
