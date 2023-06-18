import React, { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserPersonaSurveyDetails, getAppMode } from "store/selectors";
import { actions } from "store";
import { SurveyModalFooter } from "./ModalFooter";
import { SurveyConfig, OptionsConfig } from "./config";
import { shuffleOptions, shouldShowPersonaSurvey } from "./utils";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { Option, PageConfig, QuestionnaireType } from "./types";
// import { trackPersonaSurveyViewed, trackPersonaSurveySignInClicked } from "modules/analytics/events/misc/personaSurvey";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { SurveyOption } from "./Option";
import "./index.css";

interface SurveyProps {
  callback?: () => void;
  isSurveyModal: boolean;
}

export const PersonaSurvey: React.FC<SurveyProps> = ({ callback, isSurveyModal }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const currentPage = userPersona.page;

  const shuffledQ1 = useMemo(() => {
    return shuffleOptions(OptionsConfig[QuestionnaireType.PERSONA].options);
  }, []);

  const renderPageHeader = (page: PageConfig) => {
    return (
      <>
        <div className="text-center white text-bold survey-title">{page.title}</div>
        <div className="w-full survey-subtitle-wrapper">
          <div className="text-gray text-center mt-8">{page.subTitle}</div>
        </div>
      </>
    );
  };

  const renderQuestionnaire = (optionSet: QuestionnaireType) => {
    switch (optionSet) {
      case QuestionnaireType.PERSONA:
        return renderOptions(shuffledQ1, optionSet);
      default:
        return null;
    }
  };
  const renderOptions = (options: Option[], optionSet: QuestionnaireType) => {
    return (
      <>
        <div className="survey-options-container">
          {options.map((option: Option, index: number) => (
            <SurveyOption
              key={index}
              option={option}
              questionType={OptionsConfig[optionSet].questionType}
              isActive={OptionsConfig[optionSet].isActive}
              action={OptionsConfig[optionSet].action}
              fieldKey={OptionsConfig[optionSet].key}
            />
          ))}
        </div>
      </>
    );
  };

  const renderPage = (page: PageConfig) => {
    return (
      <>
        {renderPageHeader(page)}
        <>{typeof page.render === "function" ? page.render() : renderQuestionnaire(page.render)}</>
      </>
    );
  };

  useEffect(() => {
    if (SurveyConfig[currentPage]?.skip || (!isSurveyModal && currentPage === 0)) {
      dispatch(actions.updatePersonaSurveyPage(currentPage + 1));
    }
  }, [currentPage, dispatch, isSurveyModal]);

  useEffect(() => {
    if (isSurveyModal) {
      shouldShowPersonaSurvey(appMode).then((result) => {
        if (result) {
          if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
            dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal", newValue: true }));
          } else {
            if (isExtensionInstalled()) {
              const isRecommendationScreen = currentPage === 2;
              console.log({ isRecommendationScreen });
              dispatch(
                actions.toggleActiveModal({ modalName: "personaSurveyModal", newValue: !isRecommendationScreen })
              );
            }
          }
        }
      });
    }
  }, [appMode, currentPage, dispatch, isSurveyModal]);

  return (
    <div className="persona-survey-container">
      <div
        className={`survey-content-wrapper ${currentPage === SurveyConfig.length - 1 && "survey-modal-border-radius"}`}
      >
        {SurveyConfig.filter((config) => !config.skip).map((page: PageConfig, index) => (
          <React.Fragment key={index}>{currentPage === page.pageId && <>{renderPage(page)}</>}</React.Fragment>
        ))}
      </div>
      <SurveyModalFooter isSurveyModal={isSurveyModal} currentPage={currentPage} callback={callback} />
    </div>
  );
};
