import React, { useEffect } from "react";
import { Col, Modal, Row } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { getAppMode, getAppOnboardingDetails } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { OnboardingAuthScreen } from "../auth";
import { ONBOARDING_STEPS } from "../../types";
import { GettingStartedView } from "../gettingStarted";
import { PersonaScreen } from "../persona/components/personaScreen";
import { MdOutlineArrowForward } from "@react-icons/all-files/md/MdOutlineArrowForward";
import { actions } from "store";
import RQLogo from "../../../../assets/images/logo/newRQlogo.svg";
import { trackAppOnboardingSkipped, trackAppOnboardingViewed } from "features/onboarding/analytics";
import "./index.scss";
import { getAndUpdateInstallationDate } from "utils/Misc";
import Logger from "lib/logger";

interface OnboardingProps {
  isOpen: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({ isOpen }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const { step } = useSelector(getAppOnboardingDetails);

  useEffect(() => {
    getAndUpdateInstallationDate(appMode, false, false)
      .then((install_date) => {
        if (new Date(install_date) > new Date("2023-12-10")) {
          trackAppOnboardingViewed();
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
            <Col>
              <img src={RQLogo} alt="requestly logo" style={{ width: "90px" }} />
            </Col>
            {step !== ONBOARDING_STEPS.PERSONA && (
              <Col>
                <RQButton
                  type="default"
                  className="onboarding-skip-button"
                  onClick={() => {
                    trackAppOnboardingSkipped(step);
                    dispatch(actions.updateAppOnboardingCompleted());
                    dispatch(
                      actions.toggleActiveModal({
                        modalName: "appOnboardingModal",
                        newValue: false,
                      })
                    );
                  }}
                >
                  Skip for now <MdOutlineArrowForward style={{ fontSize: "1rem" }} />
                </RQButton>
              </Col>
            )}
          </Row>

          {step === ONBOARDING_STEPS.AUTH ? (
            <OnboardingAuthScreen />
          ) : step === ONBOARDING_STEPS.PERSONA ? (
            <PersonaScreen />
          ) : (
            <GettingStartedView />
          )}
        </div>
      </div>
    </Modal>
  );
};
