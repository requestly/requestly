import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { Checkbox } from "antd";
import "./index.css";
import { RQInput } from "lib/design-system/components";
import { ActiveProps } from "../../types";

interface OptionProps {
  title: string;
  type: string;
  questionType: "single" | "multiple";
  isActive?: (props: ActiveProps) => boolean;
  action?: (dispatch: any, value: string) => void;
}

export const SurveyOption: React.FC<OptionProps> = ({
  title,
  type,
  questionType,
  isActive,
  action,
}) => {
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const persona = userPersona.persona;
  const referralChannel = userPersona.referralChannel;
  const useCase = userPersona.useCase;

  const dispatch = useDispatch();
  return (
    <>
      {type === "select" ? (
        <div
          className={`survey-option survey-select ${
            isActive?.({ persona, referralChannel, useCase, title }) &&
            "outline-active-option"
          }`}
          onClick={() => action(dispatch, title)}
        >
          <div className="white text-bold survey-option-title">{title}</div>
          <Checkbox
            className={
              questionType === "single"
                ? !isActive?.({ persona, referralChannel, useCase, title }) &&
                  "hide-option-checkbox"
                : null
            }
            checked={isActive?.({ persona, referralChannel, useCase, title })}
          />
        </div>
      ) : (
        <div
          className={`survey-option survey-text ${
            isActive?.({ persona, referralChannel, useCase, title }) &&
            "outline-active-option"
          }`}
        >
          <div className="white text-bold survey-text-prefix">Other:</div>
          <RQInput
            bordered={false}
            size="middle"
            placeholder="Enter your inputs here..."
            onChange={(e) => action(dispatch, e.target.value)}
          />
          <Checkbox
            checked={isActive?.({ persona, referralChannel, useCase, title })}
            className="survey-text-suffix"
          />
        </div>
      )}
    </>
  );
};
