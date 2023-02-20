import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Layout, Col } from "antd";
import { RESOURCE_TYPE_LIST } from "..";
import { RQButton } from "lib/design-system/components";
import "../../../mocksV2/MockEditor/Editor/Header/index.css";

export const MockEditorHeader = ({
  isNewMock,
  mockType,
  savingInProgress,
  handleClose,
  handleSave,
}) => {
  const navigate = useNavigate();

  const getOldMocksRoute = () => {
    return `${
      mockType === RESOURCE_TYPE_LIST.MOCK ? "Mocks" : "Files"
    } / Editor`;
  };

  return (
    <Layout.Header className="mock-editor-layout-header">
      <Row className="w-full">
        <Col span={4} className="header-left-section">
          <RQButton
            iconOnly
            type="text"
            icon={
              <img
                alt="back"
                width="14px"
                height="12px"
                src="/assets/icons/leftArrow.svg"
              />
            }
            onClick={() => navigate(-1)}
          />
          <div className="text-gray">{getOldMocksRoute()}</div>
        </Col>
        <Col className="header-right-section">
          <RQButton type="default" onClick={() => handleClose()}>
            Cancel
          </RQButton>
          <RQButton
            type="primary"
            loading={savingInProgress}
            disabled={savingInProgress}
            onClick={() => handleSave()}
          >
            {isNewMock
              ? savingInProgress
                ? "Creating"
                : "Create"
              : savingInProgress
              ? "Saving"
              : "Save"}
          </RQButton>
        </Col>
      </Row>
    </Layout.Header>
  );
};
