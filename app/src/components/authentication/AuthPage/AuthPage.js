import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// reactstrap components
import { Col, Row } from "antd";
//SUB COMPONENTS
import AuthForm from "../AuthForm";
//UTILS
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToRules } from "../../../utils/RedirectionUtils";
//CONSTANTS
import APP_CONSTANTS from "../../../config/constants";

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;

const AuthPage = (props) => {
  const navigate = useNavigate();

  //GLOBAL STATE
  const user = useSelector(getUserAuthDetails);

  // Component State
  const [authMode, setAuthMode] = useState(props.authMode ? props.authMode : AUTH_ACTION_LABELS.LOG_IN);
  const [popoverVisible, setPopoverVisible] = useState(
    authMode === APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP ? true : true
  );

  const params = useMemo(() => new URLSearchParams(window.location.search), []);

  const getCaseInsensitiveParam = (paramName) => {
    for (const [key, value] of params.entries()) {
      if (key.toLowerCase() === paramName.toLowerCase()) {
        return value;
      }
    }
    return null;
  };

  const authMethod = getCaseInsensitiveParam("method");

  const postSignInSteps = () => {
    if (params.has("redirectUrl")) {
      navigate(params.get("redirectUrl"));
    } else {
      redirectToRules(navigate);
    }
  };

  const stablePostSignInSteps = useCallback(postSignInSteps, [navigate, params]);

  useEffect(() => {
    if (user.loggedIn && (authMode === AUTH_ACTION_LABELS.LOG_IN || authMode === AUTH_ACTION_LABELS.SIGN_UP)) {
      stablePostSignInSteps();
    }
  }, [user.loggedIn, stablePostSignInSteps, authMode]);

  return (
    <React.Fragment>
      <Row justify="center">
        <Col
          span={
            authMode === AUTH_ACTION_LABELS.LOG_IN ||
            authMode === AUTH_ACTION_LABELS.REQUEST_RESET_PASSWORD ||
            authMode === AUTH_ACTION_LABELS.DO_RESET_PASSWORD
              ? 8
              : 20
          }
        >
          {/* <Popover
            placement="left"
            content={<SignUpPremiumOffer user={user} appMode={appMode} />}
            title=""
            visible={popoverVisible}
          > */}
          <AuthForm
            authMode={authMode}
            setAuthMode={setAuthMode}
            popoverVisible={popoverVisible}
            setPopoverVisible={setPopoverVisible}
            authMethod={authMethod}
          />
          {/* </Popover> */}
        </Col>
      </Row>
    </React.Fragment>
  );
};
export default AuthPage;
