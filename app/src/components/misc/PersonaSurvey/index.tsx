import { useState } from "react";
import { RQModal } from "lib/design-system/components";
import { SurveyModalFooter } from "./components/ModalFooter";
import { surveyConfig } from "./config";
import { Option, PageConfig } from "./types";
import "./index.css";

export const PersonaSurveyModal = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  // const roleType = "frontend";
  const roleType = "backend";
  //   const roleType = "founder";
  //   const roleType = "manager";
  //   const roleType = "quality";
  //   const roleType = "marketer";

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
            <div>
              {page.options.map((option: Option) => (
                <div>{option.title}</div>
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
                <>
                  {question.options.map((option, index) => (
                    <div key={index}>{option.title}</div>
                  ))}
                </>
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
            {currentPage === page.pageId && (
              //   <div>
              //     <div className="text-center white text-bold survey-title">
              //       {page.title}
              //     </div>
              //     <div className="text-gray text-center survey-sub-title">
              //       {page.subTitle}
              //     </div>
              //     <>
              //       {page.options?.length ? (
              //         <div>
              //           {page.options.map((option: Option) => (
              //             <div>{option.title}</div>
              //           ))}
              //         </div>
              //       ) : (
              //         page.render
              //       )}
              //     </>
              //   </div>
              <>{renderPage(page, roleType)}</>
            )}
          </>
        ))}
      </div>
      <SurveyModalFooter page={currentPage} handleNextPage={updatePage} />
    </RQModal>
  );
};
