import { useState } from "react";
import { useSelector } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { RQModal } from "lib/design-system/components";
import { SurveyOption } from "./components/Option";
import { SurveyModalFooter } from "./components/ModalFooter";
import { surveyConfig } from "./config";
import { Option, PageConfig } from "./types";
import "./index.css";

export const PersonaSurveyModal = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const roleType = userPersona.persona;

  const updatePage = () => {
    setCurrentPage((current) => current + 1);
  };

  const renderPageHeader = (page: PageConfig) => {
    return (
      <>
        <div className="text-center white text-bold survey-title">
          {page.title}
        </div>
        <div className="text-gray text-center survey-sub-title">
          {page.subTitle}
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
                  title={option.title}
                  type={option.type}
                  isActive={option.isActive}
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
            <>
              {question.condition(roleType) && (
                <div className="survey-options-container">
                  {question.options.map((option, index) => (
                    <SurveyOption
                      key={index}
                      title={option.title}
                      type={option.type}
                      action={page.action}
                    />
                  ))}
                </div>
              )}
            </>
          ))}
        </>
      </>
    );
  };

  const renderPage = (page: PageConfig, roleType: string) => {
    if (page?.conditional) return renderConditionalQuestionaire(page, roleType);
    else return renderDefaultQuestionaire(page);
  };

  return (
    <RQModal centered open={true} closable={false} className="survey-modal">
      <div className="rq-modal-content survey-content-wrapper">
        {surveyConfig.map((page: PageConfig) => (
          <>
            {currentPage === page.pageId && <>{renderPage(page, roleType)}</>}
          </>
        ))}
      </div>
      <SurveyModalFooter page={currentPage} handleNextPage={updatePage} />
    </RQModal>
  );
};
