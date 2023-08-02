import React, { useCallback } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row } from "antd";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/selectors";
import { redirectToFileMockEditorCreateMock, redirectToMocksList } from "utils/RedirectionUtils";
import { FileType } from "../types";
import { IoLogoCss3, IoLogoHtml5, IoLogoJavascript } from "react-icons/io5";
import { AUTH } from "modules/analytics/events/common/constants";

const FILE_TYPES_CONFIG = {
  [FileType.HTML]: {
    TYPE: FileType.HTML,
    NAME: "Host new HTML file",
    DESCRIPTION: "Mock an HTML Response",
    ICON: () => <IoLogoHtml5 />,
    TOOL_TIP_PLACEMENT: "top",
  },
  [FileType.CSS]: {
    TYPE: FileType.CSS,
    NAME: "Host new CSS file",
    DESCRIPTION: "Mock a CSS Response",
    ICON: () => <IoLogoCss3 />,
    TOOL_TIP_PLACEMENT: "top",
  },
  [FileType.JS]: {
    TYPE: FileType.JS,
    NAME: "Host new JS file",
    DESCRIPTION: "Mock a JS Response",
    ICON: () => <IoLogoJavascript />,
    TOOL_TIP_PLACEMENT: "top",
  },
};

const NewFileTypeSelector: React.FC<{ handleTypeSelection?: (type: string) => void }> = ({ handleTypeSelection }) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);

  const renderFileTypeCard = useCallback(
    (type: string, data: any) => {
      return (
        <Col xs={12} lg={8} key={type} className="file-type-cards-container">
          <Card
            loading={false}
            size="small"
            className="new-file-modal-card"
            actions={[
              <AuthConfirmationPopover
                title={`You need to sign up to create a ${data.TYPE} file`}
                callback={() =>
                  handleTypeSelection ? handleTypeSelection(type) : redirectToFileMockEditorCreateMock(navigate, type)
                }
                source={AUTH.SOURCE.CREATE_FILE_MOCK}
              >
                <Button
                  onClick={() =>
                    user?.details?.isLoggedIn &&
                    (handleTypeSelection
                      ? handleTypeSelection(type)
                      : redirectToFileMockEditorCreateMock(navigate, type))
                  }
                  className="create-file-btn"
                  type="primary"
                >
                  Create new {`${data.TYPE}`} file <ArrowRightOutlined />
                </Button>
              </AuthConfirmationPopover>,
            ]}
          >
            <Card.Meta className="file-card-meta" avatar={<>{React.createElement(data.ICON)}</>} title={data.NAME} />
          </Card>
        </Col>
      );
    },
    [handleTypeSelection, navigate, user?.details?.isLoggedIn]
  );

  return (
    <>
      <div className="new-file-modal-title">Host new file</div>
      <p className="new-file-modal-description">
        You can use File Server to host static files like HTML, CSS, JS & Images only.
      </p>
      <p className="new-file-modal-description">
        To host JSON or mock API responses, you can use our Mock Server&nbsp;
        <Link
          to={"#"}
          onClick={(e) => {
            e.preventDefault();
            redirectToMocksList(navigate);
          }}
        >
          here
        </Link>
      </p>
      <Row gutter={[16, 16]}>
        {Object.entries(FILE_TYPES_CONFIG).map(([key, config]) => renderFileTypeCard(key, config))}
      </Row>
    </>
  );
};

export default NewFileTypeSelector;
