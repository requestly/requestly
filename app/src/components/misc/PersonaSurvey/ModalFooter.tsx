import React from "react";
import { useSelector } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { SurveyConfig } from "./config";
import { QuestionnaireType, SurveyPage } from "./types";
import "./index.css";

interface FooterProps {
  currentPage: SurveyPage;
  moveToNextPage: (response: string) => void;
}

export const SurveyModalFooter: React.FC<FooterProps> = ({ currentPage, moveToNextPage }) => {
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const currentQuestionnaire = SurveyConfig[currentPage]?.render;

  return (
    <>
      <div className="survey-footer w-full rq-modal-footer">
        <Row justify="end" align="middle">
          <Col>
            {/* Only show continue button if other option has some value or for getting started page */}
            {(typeof userPersona[currentQuestionnaire as QuestionnaireType] === "object" &&
              userPersona[currentQuestionnaire as QuestionnaireType]?.value?.length) ||
            currentPage === SurveyPage.GETTING_STARTED ? (
              <RQButton
                type="primary"
                className="text-bold"
                onClick={() => moveToNextPage(userPersona[currentQuestionnaire as QuestionnaireType])}
              >
                Continue
              </RQButton>
            ) : null}
          </Col>
        </Row>
      </div>
    </>
  );
};
