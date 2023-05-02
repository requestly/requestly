import React from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Button, Space } from "antd";
import ProCard from "@ant-design/pro-card";

//CONSTANTS
import APP_CONSTANTS from "../../../config/constants";
import { actions } from "store";
import { useNavigate } from "react-router-dom";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { AUTH } from "modules/analytics/events/common/constants";

const LoginCTA = ({ heading, content, cbUrl }) => {
  //Global State
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const promptUserToLogIn = () => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          src: APP_CONSTANTS.FEATURES.RULES,
          callback: () => {
            navigate(cbUrl);
          },
          eventSource: AUTH.SOURCE.LOGIN_CTA,
        },
      })
    );
  };

  return (
    <>
      <ProCard className="primary-card github-like-border">
        <Row style={{ textAlign: "center" }} align="center">
          <Col span={24}>
            <Jumbotron style={{ background: "transparent" }} className="text-center">
              <h1 className="display-3">{heading}</h1>
              <p className="lead">{content}</p>

              <Space>
                <Button type="primary" onClick={promptUserToLogIn}>
                  Login
                </Button>
              </Space>
            </Jumbotron>
          </Col>
        </Row>
      </ProCard>
    </>
  );
};

export default LoginCTA;
