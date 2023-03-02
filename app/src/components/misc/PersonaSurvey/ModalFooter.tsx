import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { actions } from "store";
import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { FooterProps } from "./types";
import { surveyConfig } from "./config";
import "./index.css";

export const SurveyModalFooter: React.FC<FooterProps> = ({
  page,
  handleNextPage,
}) => {
  const dispatch = useDispatch();
  const surveyLength = surveyConfig.length;
  const userPersona = useSelector(getUserPersonaSurveyDetails);

  const togglePersonaSurveyModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal" }));
  };

  const disableContinue = () => {
    switch (page) {
      case 1:
        return userPersona.persona ? false : true;
      case 2:
        return userPersona.useCase.length ? false : true;
      case 3:
        return userPersona.referralChannel ? false : true;
      default:
        return false;
    }
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

  return (
    <div className="rq-modal-footer w-full">
      <Row justify="space-between" align="middle" className="w-full">
        <Col className="text-gray">{renderModalLeftSection()}</Col>
        <Col>
          {page === surveyLength - 1 ? (
            <RQButton type="default" onClick={togglePersonaSurveyModal}>
              Skip
            </RQButton>
          ) : (
            <RQButton
              type="primary"
              className={`text-bold ${
                disableContinue() && "survey-disable-continue"
              }`}
              onClick={handleNextPage}
            >
              {page === surveyLength - 2 ? "Get started" : "Continue"}
            </RQButton>
          )}
        </Col>
      </Row>
    </div>
  );
};
