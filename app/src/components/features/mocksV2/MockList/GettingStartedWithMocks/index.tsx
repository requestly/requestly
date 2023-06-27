import React from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "antd";
import { RQButton } from "lib/design-system/components";
import { MockType } from "../../types";
import { getUserAuthDetails } from "store/selectors";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";

import { AiOutlineCloudUpload, AiOutlineQuestionCircle } from "react-icons/ai";
import { FiArrowUpRight } from "react-icons/fi";
//@ts-ignore
import noMocksIcon from "../../../../../assets/img/icons/common/no-mocks.svg";

import { AUTH } from "modules/analytics/events/common/constants";

import "./index.css";

interface Props {
  mockType: string;
  handleCreateNew: () => void;
  handleUploadAction: () => void;
}

export const GettingStartedWithMocks: React.FC<Props> = ({ mockType, handleCreateNew, handleUploadAction }) => {
  const user = useSelector(getUserAuthDetails);

  const renderDescription = () => {
    switch (mockType) {
      case MockType.FILE:
        return "Host your JS/CSS/HTML files online and use them anywhere for debugging";
      case MockType.API:
        return "Create mocks for your APIs with different status codes, delay, response headers or body";
      default:
        return "Create mocks APIs or files with different status codes, delay, response headers or body";
    }
  };

  const renderCreateMockText = () => {
    switch (mockType) {
      case MockType.FILE:
        return "Create new mock file";

      case MockType.API:
        return "Create new mock API";

      default:
        return "Create new mock API"; //for mock picker modal
    }
  };

  const renderScreenHeading = () => {
    switch (mockType) {
      case MockType.FILE:
        return "File Server";

      case MockType.API:
        return "Mock Server";

      default:
        return "Mock Server"; //for mock picker modal
    }
  };

  const renderNoMocksText = () => {
    switch (mockType) {
      case MockType.FILE:
        return "No mock files created yet";

      case MockType.API:
        return "No mock APIs created yet";

      default:
        return "No mock APIs created yet"; //for mock picker modal
    }
  };

  return (
    <Row className="empty-mocks-container">
      <Col
        xs={{ offset: 1, span: 22 }}
        sm={{ offset: 1, span: 22 }}
        md={{ offset: 2, span: 20 }}
        lg={{ offset: 3, span: 18 }}
        xl={{ offset: 4, span: 16 }}
      >
        <div className="empty-mocks-header-container">
          <div className="empty-mocks-heading">{renderScreenHeading()}</div>
          {/* description to be changed */}
          {/* <p className="empty-mocks-description">
            Note: you will be charged for each member added. Visit our guide for
            more information on how we bill.
          </p> */}
        </div>
        <div className="empty-mocks-hero-container">
          <img src={noMocksIcon} alt="no mocks" className="no-mocks-icon" />
          <div className="empty-mocks-heading">{renderNoMocksText()}</div>
          <p className="empty-mocks-description">{renderDescription()}</p>
          <div className="btns-container">
            <AuthConfirmationPopover
              title="You need to sign up to upload mocks"
              callback={handleUploadAction}
              source={mockType === MockType.API ? AUTH.SOURCE.CREATE_API_MOCK : AUTH.SOURCE.CREATE_FILE_MOCK}
            >
              <RQButton
                type="default"
                icon={<AiOutlineCloudUpload />}
                className="upload-btn"
                onClick={() => user?.loggedIn && handleUploadAction()}
              >
                <span>Upload {mockType === MockType.FILE ? "File" : "JSON"}</span>
              </RQButton>
            </AuthConfirmationPopover>
            <AuthConfirmationPopover
              title="You need to sign up to create API mocks"
              disabled={mockType === MockType.FILE}
              callback={handleCreateNew}
              source={AUTH.SOURCE.CREATE_API_MOCK}
            >
              <RQButton
                type="primary"
                className="getting-started-btn"
                onClick={(user?.loggedIn || mockType === MockType.FILE) && handleCreateNew}
              >
                {renderCreateMockText()}
              </RQButton>
            </AuthConfirmationPopover>
          </div>
        </div>
        {mockType && (
          <>
            <div className="divider"></div>
            <div className="helper-container">
              <a
                href={
                  mockType === MockType.API
                    ? "https://docs.requestly.io/getting-started/features/mock-server"
                    : "https://docs.requestly.io/getting-started/features/introduction"
                }
                target="_blank"
                rel="noreferrer"
                className="helper-item"
              >
                <FiArrowUpRight /> Browse docs
              </a>
              <a
                href="https://www.youtube.com/watch?v=l2RxXQxQ3SI"
                target="_blank"
                rel="noreferrer"
                className="helper-item"
              >
                <FiArrowUpRight /> See demo
              </a>
              <a
                href="https://requestly.io/feature/mock-server"
                target="_blank"
                rel="noreferrer"
                className="helper-item"
              >
                <AiOutlineQuestionCircle /> Learn more about {mockType === MockType.API ? "mock" : "file"} server
              </a>
            </div>
          </>
        )}
      </Col>
    </Row>
  );
};
