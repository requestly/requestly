import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { actions } from "store";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { SurveyConfig, OptionsConfig } from "./config";
import { getFormattedUserUseCases } from "./utils";
import APP_CONSTANTS from "config/constants";
import PATHS from "config/constants/sub/paths";
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
  const surveyLength = SurveyConfig.length;
  const userPersona = useSelector(getUserPersonaSurveyDetails);

  const disableContinue = () => {
    if (page === 0) return false;
    if (userPersona[OptionsConfig[page]?.key].length) return false;
    else return true;
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
        trackPersonaQ3Completed(userPersona.numberOfEmployees);
        submitAttrUtil(
          APP_CONSTANTS.GA_EVENTS.ATTR.NUMBER_OF_EMPLOYEES,
          userPersona.numberOfEmployees
        );
        if (window.location.href.includes(PATHS.SHARED_LISTS.VIEWER.RELATIVE)) {
          //don't show recommendation screen for shared list users
          dispatch(actions.updateIsPersonaSurveyCompleted(true));
        }
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
