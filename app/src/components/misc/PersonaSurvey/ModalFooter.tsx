import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserPersonaSurveyDetails, getAppMode } from "store/selectors";
import { actions } from "store";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { OptionsConfig, SurveyConfig } from "./config";
import APP_CONSTANTS from "config/constants";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { trackPersonaQ1Completed } from "modules/analytics/events/misc/personaSurvey";
import "./index.css";
import { QuestionnaireType, SurveyPage } from "./types";
import PATHS from "config/constants/sub/paths";
import { handleSurveyNavigation } from "./actions";

interface FooterProps {
  currentPage: SurveyPage;
  callback: () => void;
  isSurveyModal: boolean;
}

export const SurveyModalFooter: React.FC<FooterProps> = ({ currentPage, callback, isSurveyModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const appMode = useSelector(getAppMode);
  const currentQuestionnaire = SurveyConfig[currentPage]?.render;
  const isSharedListUser = window.location.href.includes(PATHS.SHARED_LISTS.VIEWER.RELATIVE);
  const surveyLength = useMemo(() => Object.keys(SurveyConfig).length, []);

  const disableContinue = () => {
    if (currentPage === SurveyPage.GETTING_STARTED) return false;
    if (userPersona[OptionsConfig[currentQuestionnaire as QuestionnaireType]?.key]?.length) return false;
    return true;
  };

  const handleMoveToNextPage = () => {
    switch (currentQuestionnaire) {
      case QuestionnaireType.PERSONA:
        trackPersonaQ1Completed(userPersona.persona);
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.PERSONA, userPersona.persona);
        if (isSurveyModal) {
          if (isSharedListUser || appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
            //don’t show recommendation screen for shared list users or desktop users
            dispatch(actions.updateIsPersonaSurveyCompleted(true));
            return;
          }
          dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal", newValue: false }));
          navigate(PATHS.GETTING_STARTED, {
            replace: true,
            state: {
              src: "persona_survey_modal",
              redirectTo: window.location.pathname,
            },
          });
        }
        break;
    }
    if (isSurveyModal || Object.keys(SurveyConfig).indexOf(currentPage) !== surveyLength - 1) {
      handleSurveyNavigation(currentPage, dispatch);
    } else {
      callback?.();
    }
  };

  return (
    <>
      <div className="survey-footer w-full">
        <Row justify="space-between" align="middle">
          <Col>
            {isSurveyModal && currentPage === SurveyPage.GETTING_STARTED ? (
              <>
                <span className="survey-modal-emoji">😁</span> We are excited to see you here
              </>
            ) : (
              <>
                {Object.keys(SurveyConfig).indexOf(currentPage)} / {surveyLength - 1}
              </>
            )}
          </Col>
          <Col>
            <RQButton
              type="primary"
              className={`text-bold ${disableContinue() && "survey-disable-continue"}`}
              onClick={handleMoveToNextPage}
            >
              {currentQuestionnaire === QuestionnaireType.PERSONA ? "Get started" : "Continue"}
            </RQButton>
          </Col>
        </Row>
      </div>
    </>
  );
};
