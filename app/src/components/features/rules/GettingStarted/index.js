import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Button } from "antd";
import { useFeatureIsOn, useFeatureValue } from "@growthbook/growthbook-react";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import ImportRulesModal from "../ImportRulesModal";
import { ImportFromCharlesModal } from "../ImportFromCharlesModal";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import APP_CONSTANTS from "../../../../config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { getUserAuthDetails, getAppMode, getUserPersonaSurveyDetails } from "store/selectors";
import { actions } from "store";
import { RQButton } from "lib/design-system/components";
import PersonaRecommendation from "./PersonaRecommendation";
import { trackGettingStartedVideoPlayed, trackNewRuleButtonClicked } from "modules/analytics/events/common/rules";
import {
  trackRulesImportStarted,
  trackUploadRulesButtonClicked,
  trackCharlesSettingsImportStarted,
} from "modules/analytics/events/features/rules";
import "./gettingStarted.css";

const { PATHS } = APP_CONSTANTS;

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;

const GettingStarted = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const gettingStartedVideo = useRef(null);
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(false);
  const [isImportCharlesRulesModalActive, setIsImportCharlesRulesModalActive] = useState(false);
  const isCharlesImportFeatureFlagOn = useFeatureIsOn("import_rules_from_charles");
  const appOnboardingExp = useFeatureValue("app_onboarding", null);

  const showExistingRulesBanner = !user?.details?.isLoggedIn;

  const shouldShowRecommendationScreen =
    state?.src === "persona_survey_modal" &&
    !userPersona.isSurveyCompleted &&
    appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
    appOnboardingExp === "control";

  const toggleImportRulesModal = () => {
    setIsImportRulesModalActive((prev) => !prev);
  };
  const toggleImportCharlesRulesModal = () => {
    setIsImportCharlesRulesModalActive((prev) => !prev);
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

  const handleUploadRulesClick = () => {
    setIsImportRulesModalActive(true);
    trackRulesImportStarted();
  };

  useEffect(() => {
    if (gettingStartedVideo.current) {
      gettingStartedVideo.current.addEventListener("play", () => {
        trackGettingStartedVideoPlayed();
      });
    }
  }, []);

  // useEffect(() => {
  //   if (
  //     appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
  //     !userPersona.isSurveyCompleted &&
  //     userPersona.page >= 2 &&
  //     state?.src === "persona_survey_modal"
  //   ) {
  //     dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal", newValue: false }));
  //   }
  // }, [dispatch, appMode, userPersona?.isSurveyCompleted, userPersona?.page, state?.src]);

  if (shouldShowRecommendationScreen) {
    return <PersonaRecommendation handleUploadRulesClick={handleUploadRulesClick} />;
  }

  return (
    <>
      <Row className="getting-started-container">
        <Col
          offset={1}
          span={22}
          md={{
            span: 20,
            offset: 2,
          }}
          lg={{
            span: 18,
            offset: 3,
          }}
          xl={{
            span: 14,
            offset: 5,
          }}
        >
          <>
            <div className="getting-started-header-container">
              <p className="text-gray getting-started-header">
                <span className="text-bold">👋 Welcome to Requestly!!</span> Here's a quick overview of what you can do
                with Requestly.
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
                Create rules to modify HTTP requests & responses - URL redirects, Modify APIs, Modify Headers, etc.
              </p>
              <div className="getting-started-btns-wrapper">
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
                      trackUploadRulesButtonClicked(AUTH.SOURCE.GETTING_STARTED);
                      user?.details?.isLoggedIn && handleUploadRulesClick();
                    }}
                  >
                    Upload rules
                  </RQButton>
                </AuthConfirmationPopover>

                {/* TODO: make desktop only */}
                {isCharlesImportFeatureFlagOn ? (
                  <RQButton
                    type="default"
                    onClick={() => {
                      toggleImportCharlesRulesModal();
                      trackCharlesSettingsImportStarted(AUTH.SOURCE.GETTING_STARTED);
                    }}
                  >
                    Import settings from Charles Proxy
                  </RQButton>
                ) : null}
              </div>
            </div>

            {showExistingRulesBanner ? (
              <p className="text-gray">
                👉 If you have existing rules, please{" "}
                <button onClick={handleLoginOnClick} className="getting-started-signin-link">
                  Sign in
                </button>{" "}
                to access them.
              </p>
            ) : null}
          </>
        </Col>
      </Row>
      {/* {shouldShowPersonaRecommendations && appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
        <PersonaRecommendation isUserLoggedIn={isUserLoggedIn} handleUploadRulesClick={handleUploadRulesClick} />
      ) : (
       
     )}  */}
      {isImportCharlesRulesModalActive ? (
        <ImportFromCharlesModal
          isOpen={isImportCharlesRulesModalActive}
          toggle={toggleImportCharlesRulesModal}
          analyticEventSource={AUTH.SOURCE.GETTING_STARTED}
        />
      ) : null}

      {isImportRulesModalActive ? (
        <ImportRulesModal isOpen={isImportRulesModalActive} toggle={toggleImportRulesModal} />
      ) : null}
    </>
  );
};

export default GettingStarted;
