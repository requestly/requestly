import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProCard from "@ant-design/pro-card";
import { Button, Col, Row } from "antd";
import AuthButtons from "components/authentication/LoginRequiredCTA/AuthButtons";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import img from "../../../../../assets/images/pages/error/403.svg";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { handleLogoutButtonOnClick } from "components/authentication/AuthForm/actions";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

const PermissionError = ({ isInsideIframe = false }) => {
  // Global State
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const dispatch = useDispatch();

  // Component State
  const [authAutoPrompt, setAuthAutoPrompt] = useState(false);

  const renderAuthOptions = () => {
    if (!user?.details?.profile?.email) return <AuthButtons autoPrompt={authAutoPrompt} />;

    return (
      <>
        <p>
          <span>You're currently signed in as {user?.details?.profile?.email}</span>
        </p>
        <br />
        <center>
          <Button
            type="primary"
            onClick={() => {
              handleLogoutButtonOnClick(appMode, isWorkspaceMode, dispatch);
              setAuthAutoPrompt(true);
            }}
          >
            Switch account
          </Button>
        </center>
      </>
    );
  };

  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border" style={{ height: "100%" }}>
        <Row className="hp-text-center">
          <Col span={24}>
            <Row justify="center">
              <Col>
                <img
                  className="hp-position-relative hp-d-block hp-m-auto"
                  src={img}
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
              {isInsideIframe ? (
                <h1 className="display-3">Please check the iframe source URL.</h1>
              ) : (
                <>
                  <h1 className="display-3">You need permission</h1>
                  <p className="lead">
                    Want in? Ask for access to owner of this recording, or switch to an account with permission.
                  </p>
                  {renderAuthOptions()}
                </>
              )}
            </Jumbotron>
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  );
};

export default PermissionError;
