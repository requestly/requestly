import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { Option, QuestionnaireType } from "../types";
import "./index.css";

interface OptionProps {
  option: Option;
  questionnaire: QuestionnaireType;
  action?: (dispatch: any, value: string, doClear: boolean) => void;
}

export const SurveyOption: React.FC<OptionProps> = ({ option, action, questionnaire }) => {
  const dispatch = useDispatch();
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const { title, icon } = option;
  const isActive = title === userPersona[questionnaire];

  return (
    <div
      className={`survey-option survey-select ${isActive && "outline-active-option"}`}
      onClick={() => action(dispatch, title, isActive)}
    >
      <div className="white text-bold survey-option-title">
        {<span className={`${typeof icon === "string" && "survey-modal-emoji"}`}>{icon}</span>}
        {title}
      </div>
    </div>
  );
};
