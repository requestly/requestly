import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row, Typography } from "antd";
import SpinnerColumn from "../SpinnerColumn";
import { RQButton, RQInput } from "lib/design-system/components";

import { actions } from "store";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { getAppMode, getUserAuthDetails } from "../../../store/selectors";
import { isEmailValid } from "../../../utils/FormattingHelper";

import { signInWithEmailLink } from "../../../actions/FirebaseActions";
import { handleLogoutButtonOnClick } from "../../authentication/AuthForm/actions";

import { toast } from "utils/Toast.js";
import { redirectToRules } from "utils/RedirectionUtils";

import "./index.css";

const SignInViaEmailLink = () => {
  //Component State
  const [userEmail, setUserEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCustomLoginFlow, setIsCustomLoginFlow] = useState(false);

  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const navigate = useNavigate();

  const logOutUser = useCallback(() => {
    handleLogoutButtonOnClick(appMode, isWorkspaceMode, dispatch).then(() => {
      dispatch(actions.updateRefreshPendingStatus({ type: "rules" }));
    });
  }, [appMode, dispatch, isWorkspaceMode]);

  const renderAlreadyLoggedInWarning = useCallback(() => {
    const shouldLogout = window.confirm(
      `You are already logged in${
        user.email ? ` as ${user.email}` : ""
      }. Do you want to continue login as ${userEmail}?`
    );
    if (shouldLogout === true) {
      logOutUser();
    } else {
      redirectToRules(navigate);
    }
    return <SpinnerColumn />;
  }, [user.email, userEmail, logOutUser, navigate]);
  const handleLogin = useCallback(
    (email) => {
      const loginEmail = email || userEmail;
      if (loginEmail) {
        setIsProcessing(true);
        if (user.loggedIn) {
          renderAlreadyLoggedInWarning();
        }
        signInWithEmailLink(loginEmail)
          .then((resp) => {
            if (resp) {
              window.localStorage.removeItem("RQEmailForSignIn");
              redirectToRules(navigate);
              setIsProcessing(false);
            } else throw new Error("Failed");
          })
          .catch(() => {
            toast.error("Session seems incorrect. Please contact support");
            setIsProcessing(false);
            setUserEmail(null);
          });
      } else {
        window.alert("Could not get the email to log into, please try again. If the problem persists, contact support");
      }
    },
    [userEmail, user.loggedIn, renderAlreadyLoggedInWarning, navigate]
  );

  const renderEmailInputForm = () => {
    return (
      <div className="email-entry-form-container">
        <Row className="w-100 mb-16">
          <Col span={6}>
            <label htmlFor="SignInViaEmailLinkInputField" className="text-bold auth-modal-input-label">
              <Typography.Title level={3}>Confirm email address</Typography.Title>
            </label>
          </Col>
          <Col span={18}>
            <RQInput
              id="SignInViaEmailLinkInputField"
              className="email-entry-form-input"
              placeholder="name@example.com"
              type="email"
              required
              value={userEmail ? userEmail : ""}
              onChange={(e) => {
                setUserEmail(e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row className="w-100" justify="center">
          <RQButton
            id="SignInViaEmailLinkLoginBtn"
            type="primary"
            size="large"
            onClick={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            loading={userEmail && isProcessing}
          >
            LOGIN
          </RQButton>
        </Row>
      </div>
    );
  };

  useEffect(() => {
    const emailFromStorage = window.localStorage.getItem("RQEmailForSignIn");
    if (!emailFromStorage) setIsCustomLoginFlow(true);
    else {
      const email = isEmailValid(emailFromStorage) ? emailFromStorage : null;

      setUserEmail(emailFromStorage);
      if (!user.isLoggedIn && email) {
        handleLogin(email);
      }
    }
  }, [handleLogin, user.isLoggedIn]);

  return isCustomLoginFlow ? (
    renderEmailInputForm()
  ) : user.isLoggedIn ? (
    renderAlreadyLoggedInWarning()
  ) : (
    <SpinnerColumn />
  );
};

export default SignInViaEmailLink;
