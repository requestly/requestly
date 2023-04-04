import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button } from "antd";
import ImportRulesModal from "../ImportRulesModal";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import APP_CONSTANTS from "../../../../config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { getUserAuthDetails } from "store/selectors";
import { actions } from "store";
import { RQButton } from "lib/design-system/components";
import PersonaRecommendation from "./PersonaRecommendation";
import {
  trackGettingStartedVideoPlayed,
  trackNewRuleButtonClicked,
} from "modules/analytics/events/common/rules";
import {
  trackRulesImportStarted,
  trackUploadRulesButtonClicked,
} from "modules/analytics/events/features/rules";
import "./gettingStarted.css";

const { PATHS } = APP_CONSTANTS;

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;

const GettingStarted = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  const gettingStartedVideo = useRef(null);
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(
    false
  );
  const showExistingRulesBanner = !user?.details?.isLoggedIn;
  const isUserLoggedIn = user.loggedIn;
  const __IS_PERSONA_RECOMMENDATION_FLAG_ON__ = 1;

  const toggleImportRulesModal = () => {
    setIsImportRulesModalActive(isImportRulesModalActive ? false : true);
  };

  const handleLoginOnClick = () => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          authMode: AUTH_ACTION_LABELS.LOG_IN,
          src: APP_CONSTANTS.FEATURES.RULES,
          eventSource: AUTH.SOURCE.GETTING_STARTED,
        },
      })
    );
  };

  const handleCreateMyFirstRuleClick = () => {
    trackNewRuleButtonClicked(AUTH.SOURCE.GETTING_STARTED);
    navigate(PATHS.RULES.CREATE);
  };

  const handleUploadRulesClick = useCallback(() => {
    if (window.isChinaUser) {
      setIsImportRulesModalActive(true);
      trackRulesImportStarted();
      return;
    }

    if (isUserLoggedIn) {
      setIsImportRulesModalActive(true);
      trackRulesImportStarted();
    } else {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            userActionMessage: "Sign up to upload rules",
            callback: handleUploadRulesClick,
            src: APP_CONSTANTS.FEATURES.RULES,
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
            eventSource: AUTH.SOURCE.UPLOAD_RULES,
          },
        })
      );
    }
  }, [dispatch, isUserLoggedIn]);

  useEffect(() => {
    if (gettingStartedVideo.current) {
      gettingStartedVideo.current.addEventListener("play", () => {
        trackGettingStartedVideoPlayed();
      });
    }
  }, []);

  const breakpoints = __IS_PERSONA_RECOMMENDATION_FLAG_ON__
    ? {
        md: {
          span: 20,
          offset: 2,
        },
        lg: {
          span: 18,
          offset: 3,
        },
        xl: {
          span: 18,
          offset: 3,
        },
      }
    : {
        md: {
          span: 20,
          offset: 2,
        },
        lg: {
          span: 18,
          offset: 3,
        },
        xl: {
          span: 14,
          offset: 5,
        },
      };

  return (
    <>
      <Row className="getting-started-container">
        <Col offset={1} span={22} {...breakpoints}>
          {__IS_PERSONA_RECOMMENDATION_FLAG_ON__ ? (
            <PersonaRecommendation
              isUserLoggedIn={isUserLoggedIn}
              handleUploadRulesClick={handleUploadRulesClick}
            />
          ) : (
            <>
              <div className="getting-started-header-container">
                <p className="text-gray getting-started-header">
                  <span className="text-bold">👋 Welcome to Requestly!!</span>{" "}
                  Here's a quick overview of what you can do with Requestly.
                </p>
              </div>

              <div>
                <div className="getting-started-video-container">
                  <video
                    src="https://dhuecxx44iqxd.cloudfront.net/demo/Getting-Started-vid.mp4"
                    playsInline
                    controls
                    ref={gettingStartedVideo}
                    preload="auto"
                  />
                </div>
              </div>

              <div className="getting-started-actions">
                <p className="text-gray getting-started-subtitle">
                  Create rules to modify HTTP requests & responses - URL
                  redirects, Modify APIs, Modify Headers, etc.
                </p>
                <div>
                  <Button
                    type="primary"
                    onClick={handleCreateMyFirstRuleClick}
                    className="getting-started-create-rule-btn"
                  >
                    Create your first rule
                  </Button>
                  <AuthConfirmationPopover
                    title="You need to sign up to upload rules"
                    callback={handleUploadRulesClick}
                    source={AUTH.SOURCE.UPLOAD_RULES}
                  >
                    <RQButton
                      type="default"
                      onClick={() => {
                        trackUploadRulesButtonClicked(
                          AUTH.SOURCE.GETTING_STARTED
                        );
                        user?.details?.isLoggedIn && handleUploadRulesClick();
                      }}
                    >
                      Upload rules
                    </RQButton>
                  </AuthConfirmationPopover>
                </div>
              </div>

              {showExistingRulesBanner ? (
                <p className="text-gray">
                  👉 If you have existing rules, please{" "}
                  <button
                    onClick={handleLoginOnClick}
                    className="getting-started-signin-link"
                  >
                    Sign in
                  </button>{" "}
                  to access them.
                </p>
              ) : null}
            </>
          )}
        </Col>
      </Row>

      {isImportRulesModalActive ? (
        <ImportRulesModal
          isOpen={isImportRulesModalActive}
          toggle={toggleImportRulesModal}
        />
      ) : null}
    </>
  );
};

export default GettingStarted;
