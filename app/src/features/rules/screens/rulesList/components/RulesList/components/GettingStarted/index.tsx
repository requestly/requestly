import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Button } from "antd";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import CharlesIcon from "assets/icons/charlesIcon.svg?react";
import ModheaderIcon from "assets/icons/modheaderIcon.svg?react";
import { ImportFromCharlesModal } from "../ImporterComponents/CharlesImporter";
import { ImportRulesModal } from "../../../../../../modals/ImportRulesModal";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import { getUserAuthDetails, getAppMode, getUserPersonaSurveyDetails } from "store/selectors";
import { actions } from "store";
import { RQButton } from "lib/design-system/components";
import PersonaRecommendation from "./PersonaRecommendation";
import { shouldShowRecommendationScreen } from "features/personaSurvey/utils";
import { trackGettingStartedVideoPlayed, trackNewRuleButtonClicked } from "modules/analytics/events/common/rules";
import {
  trackRulesImportStarted,
  trackUploadRulesButtonClicked,
  trackCharlesSettingsImportStarted,
} from "modules/analytics/events/features/rules";
import "./gettingStarted.css";
import { ImportFromModheaderModal } from "../ImporterComponents/ModheaderImporter/ImportFromModheaderModal";

const { PATHS } = APP_CONSTANTS;

const { ACTION_LABELS: AUTH_ACTION_LABELS } = APP_CONSTANTS.AUTH;

export const GettingStarted: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const gettingStartedVideo = useRef(null);
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(false);
  const [isImportCharlesRulesModalActive, setIsImportCharlesRulesModalActive] = useState(false);
  const [isImportModheaderRulesModalActive, setIsImportModheaderRulesModalActive] = useState(false);
  const isCharlesImportFeatureFlagOn = useFeatureIsOn("import_rules_from_charles");

  const showExistingRulesBanner = !user?.details?.isLoggedIn;

  const isRecommendationScreenVisible = useMemo(
    () => shouldShowRecommendationScreen(userPersona, appMode, state?.src),
    [appMode, state?.src, userPersona]
  );

  const toggleImportRulesModal = () => {
    setIsImportRulesModalActive((prev) => !prev);
  };
  const toggleImportCharlesRulesModal = () => {
    setIsImportCharlesRulesModalActive((prev) => !prev);
  };
  const toggleImportModheaderRulesModal = () => {
    setIsImportModheaderRulesModalActive((prev) => !prev);
  };

  const handleLoginOnClick = () => {
    dispatch(
      //@ts-ignore
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          authMode: AUTH_ACTION_LABELS.LOG_IN,
          src: APP_CONSTANTS.FEATURES.RULES,
          eventSource: SOURCE.GETTING_STARTED,
        },
      })
    );
  };

  const handleCreateMyFirstRuleClick = () => {
    trackNewRuleButtonClicked(SOURCE.GETTING_STARTED);
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

  if (isRecommendationScreenVisible) {
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
                  source={SOURCE.UPLOAD_RULES}
                  disabled={window.isChinaUser}
                >
                  <RQButton
                    type="default"
                    onClick={() => {
                      trackUploadRulesButtonClicked(SOURCE.GETTING_STARTED);
                      user?.details?.isLoggedIn && handleUploadRulesClick();
                    }}
                  >
                    Upload rules
                  </RQButton>
                </AuthConfirmationPopover>

                {/* TODO: make desktop only */}
                {isCharlesImportFeatureFlagOn ? (
                  <div className="display-row-center">
                    <RQButton
                      type="link"
                      size="small"
                      onClick={() => {
                        toggleImportCharlesRulesModal();
                        trackCharlesSettingsImportStarted(SOURCE.GETTING_STARTED);
                      }}
                    >
                      <CharlesIcon />
                      &nbsp; Import from Charles
                    </RQButton>
                    <RQButton
                      type="link"
                      size="small"
                      onClick={() => {
                        toggleImportModheaderRulesModal();
                        trackCharlesSettingsImportStarted(SOURCE.GETTING_STARTED);
                      }}
                    >
                      <ModheaderIcon />
                      &nbsp; Import from ModHeader
                    </RQButton>
                  </div>
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
      {isImportCharlesRulesModalActive ? (
        <ImportFromCharlesModal
          isOpen={isImportCharlesRulesModalActive}
          toggle={toggleImportCharlesRulesModal}
          triggeredBy={SOURCE.GETTING_STARTED}
        />
      ) : null}

      {isImportModheaderRulesModalActive ? (
        <ImportFromModheaderModal
          isOpen={isImportModheaderRulesModalActive}
          toggle={toggleImportModheaderRulesModal}
          triggeredBy={SOURCE.GETTING_STARTED}
        />
      ) : null}

      {isImportRulesModalActive ? (
        <ImportRulesModal isOpen={isImportRulesModalActive} toggle={toggleImportRulesModal} />
      ) : null}
    </>
  );
};
