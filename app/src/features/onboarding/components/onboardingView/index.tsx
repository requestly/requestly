import React from "react";
import { Col, Modal, Row } from "antd";
import { useSelector } from "react-redux";
import { getAppOnboardingDetails } from "store/selectors";
import { RQButton } from "lib/design-system/components";
import { OnboardingAuthScreen } from "../auth";
import { ONBOARDING_STEPS } from "../../types";
import { GettingStartedView } from "../gettingStarted/components/gettingStartedView";
import { PersonaScreen } from "../persona/components/personaScreen";
import { MdOutlineArrowForward } from "@react-icons/all-files/md/MdOutlineArrowForward";
import RQLogo from "../../../../assets/images/logo/newRQlogo.svg";
import "./index.scss";

export const Onboarding: React.FC = () => {
  const { step } = useSelector(getAppOnboardingDetails);

  return (
    <Modal
      open={true}
      footer={null}
      width="100%"
      className="onboarding-modal"
      wrapClassName="onboarding-modal-wrapper"
      closable={false}
    >
      <div className="onboarding-modal-body-wrapper">
        <div className="onboarding-modal-body">
          {/* HEADER */}
          <Row justify="space-between" className="w-full onboarding-modal-header">
            <Col>
              <img src={RQLogo} alt="requestly logo" style={{ width: "90px" }} />
            </Col>
            {step !== ONBOARDING_STEPS.PERSONA && (
              <Col>
                <RQButton type="default" className="onboarding-skip-button">
                  Skip for now <MdOutlineArrowForward style={{ fontSize: "1rem" }} />
                </RQButton>
              </Col>
            )}
          </Row>

          {/* BODY */}

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
