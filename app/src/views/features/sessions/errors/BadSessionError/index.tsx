import React from "react";
import ProCard from "@ant-design/pro-card";
import { Col, Row } from "antd";
import img from "../../../../../assets/images/pages/error/403.svg";

const BadSessionError = () => {
  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border">
        <Row className="hp-text-center">
          <Col span={24}>
            <Row justify="center">
              <Col>
                <img className="hp-position-relative hp-d-block hp-m-auto" src={img} alt="403" height={300} />
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className="text-center" align="middle">
          <Col span={24}>
            <h1 className="display-3">There is some error in this session replay</h1>
            <p className="lead">
              Please contact support at <a href="mailto:contact@requestly.io">contact@requestly.io</a>
            </p>
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  );
};

export default BadSessionError;
