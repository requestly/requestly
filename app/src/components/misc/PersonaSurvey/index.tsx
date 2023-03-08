import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getAppMode,
  getUserAuthDetails,
  getUserPersonaSurveyDetails,
} from "store/selectors";
import { RQButton, RQModal } from "lib/design-system/components";
import { SurveyOption } from "./Option";
import { SurveyModalFooter } from "./ModalFooter";
import { surveyConfig } from "./config";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { shouldShowPersonaSurvey } from "./utils";
import { Option, PageConfig } from "./types";
import {
  trackPersonaSurveyViewed,
  trackPersonaRecommendationSkipped,
} from "modules/analytics/events/misc/personaSurvey";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { actions } from "store";
import "./index.css";

interface PersonaModalProps {
  isOpen: boolean;
  toggle: () => void;
  toggleImportRulesModal: () => void;
}

export const PersonaSurveyModal: React.FC<PersonaModalProps> = ({
  isOpen,
  toggle,
  toggleImportRulesModal,
}) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const currentPage = userPersona.page;
  const roleType = userPersona.persona;

  const renderPageHeader = (page: PageConfig) => {
    return (
      <>
        {currentPage === surveyConfig.length - 1 && (
          <RQButton
            type="link"
            onClick={() => {
              toggle();
              dispatch(actions.updateIsPersonaSurveyCompleted(true));
              trackPersonaRecommendationSkipped();
            }}
            className="white skip-recommendation"
          >
            Skip
          </RQButton>
        )}
        <div className="text-center white text-bold survey-title">
          {page.title}
        </div>
        <div className="w-full survey-subtitle-wrapper">
          <div className="text-gray text-center survey-sub-title">
            {page.subTitle}
          </div>
        </div>
      </>
    );
  };

  const renderDefaultQuestionaire = (page: PageConfig) => {
    return (
      <>
        {renderPageHeader(page)}
        <>
          {page.options?.length ? (
            <div className="survey-options-container">
              {page.options.map((option: Option, index) => (
                <SurveyOption
                  key={index}
                  fieldKey={page.key}
                  option={option}
                  questionType={page.questionType}
                  isActive={page.isActive}
                  action={page.action}
                />
              ))}
            </div>
          ) : (
            page.render(toggleImportRulesModal)
          )}
        </>
      </>
    );
  };

  const renderConditionalQuestionaire = (
    page: PageConfig,
    roleType: string
  ) => {
    return (
      <>
        {renderPageHeader(page)}
        <>
          {page.conditional.map((question, index) => (
            <React.Fragment key={index}>
              {question.condition(roleType) && (
                <div className="survey-options-container">
                  {question.options.map((option, index) => (
                    <SurveyOption
                      key={index}
                      fieldKey={page.key}
                      option={option}
                      questionType={page.questionType}
                      isActive={page.isActive}
                      action={page.action}
                    />
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </>
      </>
    );
  };

  const renderPage = (page: PageConfig, roleType: string) => {
    if (page?.conditional) return renderConditionalQuestionaire(page, roleType);
    else return renderDefaultQuestionaire(page);
  };

  useEffect(() => {
    shouldShowPersonaSurvey(appMode).then((result) => {
      if (result) {
        if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
          toggle();
          trackPersonaSurveyViewed();
        } else {
          if (isExtensionInstalled()) {
            toggle();
            trackPersonaSurveyViewed();
          }
        }
      }
    });
  }, [appMode, user.loggedIn, toggle]);

  return (
    <RQModal
      bodyStyle={{ width: "550px" }}
      centered
      open={isOpen}
      closable={false}
      className="survey-modal"
    >
      <div
        className={`rq-modal-content survey-content-wrapper ${
          currentPage === surveyConfig.length - 1 &&
          "survey-modal-border-radius"
        }`}
      >
        {surveyConfig.map((page: PageConfig, index) => (
          <React.Fragment key={index}>
            {currentPage === page.pageId && <>{renderPage(page, roleType)}</>}
          </React.Fragment>
        ))}
      </div>
      <SurveyModalFooter
        page={currentPage}
        fieldKey={surveyConfig[currentPage].key}
      />
    </RQModal>
  );
};
