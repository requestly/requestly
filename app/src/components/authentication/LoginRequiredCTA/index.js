import React from "react";
import ProCard from "@ant-design/pro-card";
import { Row, Col } from "antd";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import AuthButtons from "./AuthButtons";

const LoginRequiredCTA = ({ src, hardRedirect }) => {
  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border login-required-view">
        <Row style={{ textAlign: "center" }} align="center">
          <Col span={24}>
            <Jumbotron style={{ background: "transparent" }} className="text-center">
              <h1 className="display-3">{"You need to sign in first!"}</h1>
              <p className="lead">{"Please make sure you're signed in to your account before accessing this page."} </p>
              <AuthButtons src={src} hardRedirect={hardRedirect} />
            </Jumbotron>
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  );
};

export default LoginRequiredCTA;
