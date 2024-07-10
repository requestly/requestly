import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Modal, Row } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { getAppMode, getAppOnboardingDetails } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { AuthScreen } from "../auth";
import { ONBOARDING_STEPS } from "../../types";
import { RecommendationsView } from "../recommendations";
import { PersonaScreen } from "../persona/components/personaScreen";
import { MdOutlineArrowForward } from "@react-icons/all-files/md/MdOutlineArrowForward";
import { actions } from "store";
import RQLogo from "assets/img/brand/rq_logo_full.svg";
import { trackAppOnboardingSkipped } from "features/onboarding/analytics";
import { getAndUpdateInstallationDate } from "utils/Misc";
import Logger from "lib/logger";
import { WorkspaceOnboardingView } from "../teams";
import { redirectToWebAppHomePage } from "utils/RedirectionUtils";
import { SOURCE } from "modules/analytics/events/common/constants";
import APP_CONSTANTS from "config/constants";
import { useFeatureValue } from "@growthbook/growthbook-react";
import "./index.scss";

interface OnboardingProps {
  isOpen: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const { step, disableSkip } = useSelector(getAppOnboardingDetails);
  const onboardingVariation = useFeatureValue("onboarding_activation_v2", "variant1");

  const handleSkip = () => {
    trackAppOnboardingSkipped(step);
    if (step === ONBOARDING_STEPS.AUTH) {
      dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.PERSONA));
    } else if (step === ONBOARDING_STEPS.TEAMS) {
      dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.RECOMMENDATIONS));
    } else {
      redirectToWebAppHomePage(navigate);
      dispatch(actions.updateAppOnboardingCompleted());
      dispatch(
        actions.toggleActiveModal({
          modalName: "appOnboardingModal",
          newValue: false,
        })
      );
    }
  };

  useEffect(() => {
    dispatch(actions.updateIsAppOnboardingStepDisabled(false));
  }, [dispatch]);

  useEffect(() => {
    getAndUpdateInstallationDate(appMode, false, false)
      .then((install_date) => {
        if (new Date(install_date) >= new Date("2024-06-21")) {
          dispatch(
            actions.toggleActiveModal({
              modalName: "appOnboardingModal",
              newValue: true,
            })
          );
        }
      })
      .catch((err) => {
        Logger.log(err);
      });
  }, [appMode, dispatch]);

  return (
    <Modal
      open={isOpen}
      footer={null}
      width="100%"
      className="onboarding-modal"
      wrapClassName="onboarding-modal-wrapper"
      closable={false}
    >
      <div className="onboarding-modal-body-wrapper">
        <div className="onboarding-modal-body">
          <Row justify="space-between" className="w-full onboarding-modal-header">
            {onboardingVariation !== "variant3" ? (
              <Col>
                <img src={RQLogo} alt="requestly logo" style={{ width: "90px" }} />
              </Col>
            ) : null}

            {step === ONBOARDING_STEPS.PERSONA ||
            disableSkip ||
            (step === ONBOARDING_STEPS.AUTH && onboardingVariation === "variant3") ? null : (
              <Col>
                <RQButton type="default" className="onboarding-skip-button" onClick={handleSkip}>
                  Skip for now <MdOutlineArrowForward style={{ fontSize: "1rem" }} />
                </RQButton>
              </Col>
            )}
          </Row>

          {step === ONBOARDING_STEPS.AUTH ? (
            <AuthScreen
              isOpen={isOpen}
              defaultAuthMode={APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP}
              source={SOURCE.APP_ONBOARDING}
              isOnboarding
            />
          ) : step === ONBOARDING_STEPS.PERSONA ? (
            <PersonaScreen isOpen={isOpen} />
          ) : step === ONBOARDING_STEPS.TEAMS ? (
            <WorkspaceOnboardingView isOpen={isOpen} />
          ) : (
            <RecommendationsView isOpen={isOpen} />
          )}
        </div>
      </div>
    </Modal>
  );
};
