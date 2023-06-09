import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { SurveyModalFooter } from "./ModalFooter";
import { SurveyConfig, OptionsConfig } from "./config";
import { shuffleOptions } from "./utils";
import { Option, PageConfig, QuestionFor } from "./types";
// import { trackPersonaSurveyViewed, trackPersonaSurveySignInClicked } from "modules/analytics/events/misc/personaSurvey";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { SurveyOption } from "./Option";
import "./index.css";

interface SurveyProps {
  callback: () => void;
}

export const PersonaSurvey: React.FC<SurveyProps> = ({ callback }) => {
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const currentPage = userPersona.page;

  const shuffledQ1 = useMemo(() => {
    return shuffleOptions(OptionsConfig[QuestionFor.PERSONA].options);
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

  const renderQuestionnaire = (optionSet: QuestionFor) => {
    switch (optionSet) {
      case QuestionFor.PERSONA:
        return renderOptions(shuffledQ1, optionSet);
      default:
        return null;
    }
  };
  const renderOptions = (options: Option[], optionSet: QuestionFor) => {
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
        <>{renderQuestionnaire(page.render)}</>
      </>
    );
  };

  return (
    <div
      className="persona-survey-container"
      // maskStyle={{ background: "#0d0d10" }}
    >
      <div
        className={`rq-modal-content survey-content-wrapper ${
          currentPage === SurveyConfig.length - 1 && "survey-modal-border-radius"
        }`}
      >
        {SurveyConfig.filter((config) => !config.skip).map((page: PageConfig, index) => (
          <React.Fragment key={index}>{currentPage === page.pageId && <>{renderPage(page)}</>}</React.Fragment>
        ))}
      </div>
      <SurveyModalFooter currentPage={currentPage} callback={callback} />
    </div>
  );
};
