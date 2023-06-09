import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { actions } from "store";
import { Col } from "antd";
import { RQButton } from "lib/design-system/components";
import { OptionsConfig, SurveyConfig } from "./config";
import APP_CONSTANTS from "config/constants";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import { trackPersonaQ1Completed } from "modules/analytics/events/misc/personaSurvey";
import "./index.css";
import { QuestionFor } from "./types";

interface FooterProps {
  currentPage: number;
}

export const SurveyModalFooter: React.FC<FooterProps> = ({ currentPage }) => {
  const dispatch = useDispatch();
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const currentQuestionnaire = SurveyConfig[currentPage]?.render;

  const disableContinue = () => {
    if (userPersona[OptionsConfig[currentQuestionnaire]?.key]?.length) return false;
    return true;
  };

  const handleMoveToNextPage = () => {
    switch (currentQuestionnaire) {
      case QuestionFor.PERSONA:
        trackPersonaQ1Completed(userPersona.persona);
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.PERSONA, userPersona.persona);
        break;
      //   case 2:
      //     trackPersonaQ2Completed(getFormattedUserUseCases(userPersona.useCases));
      //     submitAttrUtil(
      //       APP_CONSTANTS.GA_EVENTS.ATTR.USE_CASES,
      //       getFormattedUserUseCases(userPersona.useCases)
      //     );
      //     break;
      // case 3:
      // trackPersonaQ3Completed(userPersona.referralChannel);
      // submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.REFERRAL_CHANNEL, userPersona.referralChannel);
      // if (isSharedListUser || appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
      //   //don't show recommendation screen for shared list users or desktop users
      //   dispatch(actions.updateIsPersonaSurveyCompleted(true));
      //   return;
      // }

      // dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal", newValue: false }));
      // navigate(PATHS.GETTING_STARTED, {
      //   replace: true,
      //   state: {
      //     src: "persona_survey_modal",
      //     redirectTo: location.pathname,
      //   },
      // });
      // break;
    }
    dispatch(actions.updatePersonaSurveyPage(currentPage + 1));
  };
  return (
    <>
      <div className="rq-modal-footer w-full">
        <Col>
          <RQButton
            type="primary"
            className={`text-bold ${disableContinue() && "survey-disable-continue"}`}
            onClick={handleMoveToNextPage}
          >
            {currentQuestionnaire === QuestionFor.PERSONA ? "Get started" : "Continue"}
          </RQButton>
        </Col>
      </div>
    </>
  );
};
