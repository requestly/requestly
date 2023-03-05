import React from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  getAppMode,
  getUserAuthDetails,
  getUserPersonaSurveyDetails,
} from "store/selectors";
import { RQModal } from "lib/design-system/components";
import { SurveyOption } from "./Option";
import { SurveyModalFooter } from "./ModalFooter";
import { surveyConfig } from "./config";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { isNewInstall } from "./utils";
import { Option, PageConfig } from "./types";
import { trackPersonaSurveyViewed } from "modules/analytics/events/misc/personaSurvey";
import "./index.css";

interface PersonaModalProps {
  isOpen: boolean;
  toggle: () => void;
}

export const PersonaSurveyModal: React.FC<PersonaModalProps> = ({
  isOpen,
  toggle,
}) => {
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const currentPage = userPersona.page;
  const roleType = userPersona.persona;
  const isSurveyCompleted = userPersona.isSurveyCompleted;

  const renderPageHeader = (page: PageConfig) => {
    return (
      <>
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
            page.render
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
    trackPersonaSurveyViewed();
  }, []);

  useEffect(() => {
    if (!isSurveyCompleted)
      if (isExtensionInstalled() && isNewInstall(appMode, user.loggedIn))
        toggle();
  }, [isSurveyCompleted, toggle, appMode, user.loggedIn]);

  return (
    <>
      {!userPersona.isSurveyCompleted && (
        <RQModal
          bodyStyle={{ width: "550px" }}
          centered
          open={isOpen}
          closable={false}
          className="survey-modal"
        >
          <div className="rq-modal-content survey-content-wrapper">
            {surveyConfig.map((page: PageConfig, index) => (
              <React.Fragment key={index}>
                {currentPage === page.pageId && (
                  <>{renderPage(page, roleType)}</>
                )}
              </React.Fragment>
            ))}
          </div>
          <SurveyModalFooter
            page={currentPage}
            fieldKey={surveyConfig[currentPage].key}
          />
        </RQModal>
      )}
    </>
  );
};
