import React from "react";
import { Row, Col } from "antd";
import ProCard from "@ant-design/pro-card";
import activateRequestly from "assets/img/screenshots/activate_requestly.png";
import Jumbotron from "components/bootstrap-legacy/jumbotron";

const ExtensionDeactivationMessage = () => {
  return (
    <>
      <ProCard className="primary-card github-like-border">
        <Row style={{ textAlign: "center" }} align="center">
          <Col span={24}>
            <Jumbotron className="text-center">
              <h1 className="display-3">Extension is deactivated</h1>
              <p className="lead">
                Please activate the extension by right clicking on it and selecting{" "}
                <span style={{ cursor: "auto", fontWeight: "bold" }}>Activate Requestly</span> option and then reload
                this page.
              </p>
              <img style={{ maxWidth: "40vh" }} src={activateRequestly} alt="activate requestly" />
            </Jumbotron>
          </Col>
        </Row>
      </ProCard>
    </>
  );
};

export default ExtensionDeactivationMessage;
