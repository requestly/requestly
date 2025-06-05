import React from "react";
import ProCard from "@ant-design/pro-card";
import { Button, Col, Row } from "antd";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { useNavigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";

// DUPLICATED
// TODO: REMOVE OLD FILE
const NotFoundError = () => {
  const navigate = useNavigate();

  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border" style={{ height: "100%" }}>
        <Row className="hp-text-center">
          <Col span={24}>
            <Row justify="center">
              <Col>
                <img
                  className="hp-position-relative hp-d-block hp-m-auto"
                  src={"/assets/media/common/403.svg"}
                  alt="403"
                  style={{ maxHeight: "30vh" }}
                />
              </Col>
            </Row>
          </Col>
        </Row>

        <Row style={{ textAlign: "center" }} align="center">
          <Col span={24}>
            <Jumbotron style={{ background: "transparent" }} className="text-center">
              <h1 className="display-3">The session replay you were looking for does not exist.</h1>
              <center>
                <Button
                  type="primary"
                  onClick={() => {
                    navigate(PATHS.SESSIONS.RELATIVE);
                  }}
                >
                  Go Back
                </Button>
              </center>
            </Jumbotron>
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  );
};

export default NotFoundError;
