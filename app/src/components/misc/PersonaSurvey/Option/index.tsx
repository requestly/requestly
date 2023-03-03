import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { Checkbox } from "antd";
import "./index.css";
import { RQInput } from "lib/design-system/components";
import { ActiveProps, Option, useCaseOptions } from "../types";

interface OptionProps {
  option: Option;
  questionType: "single" | "multiple";
  isActive?: (props: ActiveProps) => boolean;
  action?: (
    dispatch: any,
    value: string,
    clear: boolean,
    optionType?: string
  ) => void;
  fieldKey: string;
}

export const SurveyOption: React.FC<OptionProps> = ({
  option,
  questionType,
  isActive,
  action,
  fieldKey,
}) => {
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const persona = userPersona.persona;
  const referralChannel = userPersona.referralChannel;
  const useCase = userPersona.useCase;

  const { title, type, icon } = option;
  const dispatch = useDispatch();

  const [customInput, setCustomInput] = useState<string>(null);

  useEffect(() => {
    if (type === "text") {
      const option = userPersona[fieldKey].find(
        (option: useCaseOptions) => option.optionType === "other"
      );
      if (option) setCustomInput(option.value);
      else setCustomInput(null);
    }
  }, [fieldKey, type, userPersona]);

  return (
    <>
      {type === "select" ? (
        <div
          className={`survey-option survey-select ${
            isActive?.({ persona, referralChannel, useCase, title }) &&
            "outline-active-option"
          }`}
          onClick={() =>
            action(
              dispatch,
              title,
              isActive?.({ persona, referralChannel, useCase, title }),
              "select"
            )
          }
        >
          <div className="white text-bold survey-option-title">
            {
              <span
                className={`${
                  typeof icon === "string" && "survey-modal-emoji"
                }`}
              >
                {icon}
              </span>
            }
            {title}
          </div>
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
            isActive?.({
              persona,
              referralChannel,
              useCase,
              title,
              optionType: "other",
            }) && "outline-active-option"
          }`}
        >
          <div className="white text-bold survey-text-prefix">Other:</div>
          <RQInput
            bordered={false}
            size="middle"
            placeholder="Enter your inputs here..."
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              let title = e.target.value;
              action(
                dispatch,
                title,
                isActive?.({ persona, referralChannel, useCase, title }),
                "other"
              );
            }}
          />
          <>
            {isActive?.({
              persona,
              referralChannel,
              useCase,
              title,
              optionType: "other",
            }) && <Checkbox checked={true} className="survey-text-suffix" />}
          </>
        </div>
      )}
    </>
  );
};
