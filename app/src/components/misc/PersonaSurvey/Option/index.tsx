import React, { useState, useEffect } from "react";
import { RQInput } from "lib/design-system/components";
import { useDispatch, useSelector } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { Option, OtherOption, QuestionnaireType } from "../types";
import "./index.css";

interface OptionProps {
  option: Option;
  questionnaire: QuestionnaireType;
  action?: (dispatch: any, value: string | OtherOption, doClear: boolean) => void;
}

export const SurveyOption: React.FC<OptionProps> = ({ option, action, questionnaire }) => {
  const dispatch = useDispatch();
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const [otherValue, setOtherValue] = useState<OtherOption>({ type: "other", value: "" });
  const { title, icon, type } = option;
  const isActive = type === "other" ? otherValue === userPersona[questionnaire] : title === userPersona[questionnaire];

  useEffect(() => {
    if (typeof userPersona[questionnaire] === "object") {
      setOtherValue(userPersona[questionnaire]);
    }
  }, [questionnaire, userPersona]);

  return (
    <>
      {type === "other" ? (
        <div
          className={`survey-option survey-input-option ${isActive && "outline-active-option"}`}
          style={{ width: "100%" }}
        >
          <RQInput
            prefix={<span className="text-bold">Other : </span>}
            value={otherValue.value}
            onChange={(e) => {
              const value = e.target.value;
              setOtherValue((prev) => {
                return { ...prev, value };
              });
              action(dispatch, { ...otherValue, value }, false);
            }}
          />
        </div>
      ) : (
        <div
          className={`survey-option survey-select ${isActive && "outline-active-option"}`}
          onClick={() => action(dispatch, title, isActive)}
        >
          <div className="white text-bold survey-option-title">
            {<span className={`${typeof icon === "string" && "survey-modal-emoji"}`}>{icon}</span>}
            {title}
          </div>
        </div>
      )}
    </>
  );
};
