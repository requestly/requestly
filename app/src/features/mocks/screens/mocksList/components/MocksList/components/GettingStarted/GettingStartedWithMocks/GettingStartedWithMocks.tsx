import React from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "antd";
import { RQButton } from "lib/design-system/components";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { AiOutlineCloudUpload } from "@react-icons/all-files/ai/AiOutlineCloudUpload";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { FiArrowUpRight } from "@react-icons/all-files/fi/FiArrowUpRight";
import { LuImport } from "@react-icons/all-files/lu/LuImport";
import { SOURCE } from "modules/analytics/events/common/constants.js";
import { MockType } from "components/features/mocksV2/types";
import "./gettingStartedWithMocks.scss";
import { getLinkWithMetadata } from "modules/analytics/metadata";

interface Props {
  mockType: MockType;
  handleCreateNew: () => void;
  handleUploadAction: () => void;
  handleImportAction: () => void;
}

export const GettingStartedWithMocks: React.FC<Props> = ({
  mockType,
  handleCreateNew,
  handleUploadAction,
  handleImportAction,
}) => {
  const user = useSelector(getUserAuthDetails);

  const renderDescription = () => {
    switch (mockType) {
      case MockType.FILE:
        return "Host your JS/CSS files online and use them anywhere - prefect for debugging or overriding live assets";
      case MockType.API:
        return "Store and serve JSON responses from the cloud to power your frontend development - no backend setup needed";
      default:
        return "Create mocks APIs or files with different status codes, delay, response headers or body";
    }
  };

  const renderCreateMockText = () => {
    switch (mockType) {
      case MockType.FILE:
        return "Create JS/CSS file";

      case MockType.API:
        return "Create JSON file";

      default:
        return "Create new mock API"; //for mock picker modal
    }
  };

  const renderScreenHeading = () => {
    switch (mockType) {
      case MockType.FILE:
        return "File Server";

      case MockType.API:
        return "File Server";

      default:
        return "File Server"; //for mock picker modal
    }
  };

  const renderNoMocksText = () => {
    switch (mockType) {
      case MockType.FILE:
        return "No JS/CSS Files created yet";

      case MockType.API:
        return "No JSON Files created yet";

      default:
        return "No mocks created yet"; //for mock picker modal
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
          <img src={"/assets/media/mocks/no-mocks.svg"} alt="no mocks" className="no-mocks-icon" />
          <div className="empty-mocks-heading">{renderNoMocksText()}</div>
          <p className="empty-mocks-description">{renderDescription()}</p>
          <div className="btns-container">
            <AuthConfirmationPopover
              title="You need to sign up to upload file"
              callback={handleUploadAction}
              source={mockType === MockType.API ? SOURCE.CREATE_API_MOCK : SOURCE.CREATE_FILE_MOCK}
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
              title="You need to sign up to import file"
              callback={handleImportAction}
              source={SOURCE.MOCKS_GETTING_STARTED}
            >
              <RQButton
                type="default"
                icon={<LuImport className="anticon" />}
                onClick={() => user?.loggedIn && handleImportAction?.()}
              >
                <span>Import</span>
              </RQButton>
            </AuthConfirmationPopover>
            <AuthConfirmationPopover
              title="You need to sign up to create JSON file"
              disabled={mockType === MockType.FILE}
              callback={handleCreateNew}
              source={SOURCE.CREATE_API_MOCK}
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
                    ? "https://docs.requestly.com/general/mock-server/create/create-mock-api"
                    : "https://docs.requestly.com/general/mock-server/create/create-new-mock-file"
                }
                target="_blank"
                rel="noreferrer"
                className="helper-item"
              >
                <FiArrowUpRight /> Browse docs
              </a>
              <a
                href={getLinkWithMetadata("https://requestly.com/products/mock-server/")}
                target="_blank"
                rel="noreferrer"
                className="helper-item"
              >
                <AiOutlineQuestionCircle /> Learn more about file server
              </a>
            </div>
          </>
        )}
      </Col>
    </Row>
  );
};
