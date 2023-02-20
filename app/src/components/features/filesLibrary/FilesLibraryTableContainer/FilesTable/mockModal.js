import React from "react";
import { Row, Col, Button, Card } from "antd";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
//Config
import APP_CONSTANTS from "../../../../../config/constants";
import { redirectToCreateNewFile } from "utils/RedirectionUtils";

const { MOCK_TYPES_CONFIG } = APP_CONSTANTS;

const NewMockSelector = (props) => {
  const { isOpen, toggle } = props;
  // Navigate
  const navigate = useNavigate();

  const handleCreateOnClick = (mockType) => {
    //Continue allowing
    redirectToCreateNewFile(navigate, mockType);
  };
  return (
    <>
      <Modal
        // className="modal-dialog-centered max-width-70-percent"
        visible={isOpen}
        onCancel={toggle}
        footer={null}
        title="Host New File"
        width={800}
      >
        <div>
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ textAlign: "center" }}>
              You can use File Server to host static files like HTML, CSS, JS &
              Images only.
            </h3>
            <h3 style={{ textAlign: "center" }}>
              To host JSON or mock API responses, you can use our Mock Server
              here.{" "}
              <a
                href={APP_CONSTANTS.LINKS.REQUESTLY_DOCS_MOCK_SERVER}
                target="_blank"
                rel="noreferrer nofollow"
              >
                here
              </a>{" "}
            </h3>
          </div>

          <Row gutter={[16, 16]}>
            {Object.entries(MOCK_TYPES_CONFIG).map(([key, MOCK_CONFIG]) => {
              // To check extension version for delay rule compatibility
              // negative check
              return (
                <Col xs={12} sm={8} lg={8} key={MOCK_CONFIG.ID}>
                  <Card
                    loading={false}
                    hoverable={true}
                    style={{
                      height: "100%",
                      display: "flex",
                      flexFlow: "column",
                      cursor: "default",
                    }}
                    size="small"
                    bodyStyle={{ flexGrow: "1" }}
                    actions={[
                      <Button
                        onClick={() => handleCreateOnClick(MOCK_CONFIG.TYPE)}
                        type="primary"
                      >
                        {" "}
                        Create new {`${MOCK_CONFIG.TYPE}`} file
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      avatar={<>{React.createElement(MOCK_CONFIG.ICON)}</>}
                      title={MOCK_CONFIG.NAME}
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </Modal>
    </>
  );
};

export default NewMockSelector;
