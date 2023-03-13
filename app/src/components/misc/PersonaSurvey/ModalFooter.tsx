import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { actions } from "store";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { surveyConfig } from "./config";
import { getFormattedUserUseCases } from "./utils";
import APP_CONSTANTS from "config/constants";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import {
  trackPersonaQ1Completed,
  trackPersonaQ2Completed,
  trackPersonaQ3Completed,
  trackPersonaQuestionnaireStarted,
} from "modules/analytics/events/misc/personaSurvey";
import "./index.css";

interface FooterProps {
  page: number;
}

export const SurveyModalFooter: React.FC<FooterProps> = ({ page }) => {
  const dispatch = useDispatch();
  const surveyLength = surveyConfig.length;
  const userPersona = useSelector(getUserPersonaSurveyDetails);

  const disableContinue = () => {
    switch (page) {
      case 0:
        return false;
      case 1:
        return userPersona.persona ? false : true;
      case 2:
        return userPersona.useCases.length ? false : true;
      case 3:
        return userPersona.referralChannel ? false : true;
      default:
        return true;
    }
  };

  const renderModalLeftSection = () => {
    if (page === 0)
      return (
        <>
          <span className="survey-modal-emoji">😁</span> We are excited to see
          you here
        </>
      );

    if (page > 0 && page <= surveyLength - 2) {
      return (
        <>
          {page}/{surveyLength - 2}
        </>
      );
    } else return null;
  };

  const handleMoveToNextPage = () => {
    switch (page) {
      case 0:
        trackPersonaQuestionnaireStarted();
        break;
      case 1:
        trackPersonaQ1Completed(userPersona.persona);
        submitAttrUtil(
          APP_CONSTANTS.GA_EVENTS.ATTR.PERSONA,
          userPersona.persona
        );
        break;
      case 2:
        trackPersonaQ2Completed(getFormattedUserUseCases(userPersona.useCases));
        submitAttrUtil(
          APP_CONSTANTS.GA_EVENTS.ATTR.USE_CASES,
          getFormattedUserUseCases(userPersona.useCases)
        );
        break;
      case 3:
        trackPersonaQ3Completed(userPersona.referralChannel);
        submitAttrUtil(
          APP_CONSTANTS.GA_EVENTS.ATTR.REFERRAL_CHANNEL,
          userPersona.referralChannel
        );
        break;
    }
    dispatch(actions.updatePersonaSurveyPage(page + 1));
  };

  return (
    <>
      {page !== surveyLength - 1 && (
        <div className="rq-modal-footer w-full">
          <Row justify="space-between" align="middle" className="w-full">
            <Col className="text-gray">{renderModalLeftSection()}</Col>
            <Col>
              <RQButton
                type="primary"
                className={`text-bold ${
                  disableContinue() && "survey-disable-continue"
                }`}
                onClick={handleMoveToNextPage}
              >
                {page === surveyLength - 2 ? "Get started" : "Continue"}
              </RQButton>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};
