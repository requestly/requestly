import React, { useMemo } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Typography } from "antd";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/selectors";
import { redirectToFileMockEditorCreateMock, redirectToMocksList } from "utils/RedirectionUtils";
import { FileType } from "../types";
import { IoLogoCss3 } from "@react-icons/all-files/io5/IoLogoCss3";
import { IoLogoHtml5 } from "@react-icons/all-files/io5/IoLogoHtml5";
import { IoLogoJavascript } from "@react-icons/all-files/io5/IoLogoJavascript";
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

  const fileTypeCard = useMemo(() => {
    return Object.entries(FILE_TYPES_CONFIG).map(([type, data]) => (
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
                  (handleTypeSelection ? handleTypeSelection(type) : redirectToFileMockEditorCreateMock(navigate, type))
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
    ));
  }, [handleTypeSelection, navigate, user?.details?.isLoggedIn]);

  return (
    <>
      <Typography.Title level={4} className="new-file-modal-title">
        Host new file
      </Typography.Title>
      <div className="mb-16">
        <Typography.Text type="secondary" className="new-file-modal-description">
          You can use File Server to host static files like HTML, CSS, JS & Images only.
        </Typography.Text>
        <br />
        <Typography.Text type="secondary" className="new-file-modal-description">
          To host JSON or mock API responses, you can use our Mock Server&nbsp;
          <Link
            to={"#"}
            onClick={(e) => {
              e.preventDefault();
              redirectToMocksList(navigate);
            }}
          >
            here.
          </Link>
        </Typography.Text>
      </div>
      <Row gutter={[16, 16]}>{fileTypeCard}</Row>
    </>
  );
};

export default NewFileTypeSelector;
