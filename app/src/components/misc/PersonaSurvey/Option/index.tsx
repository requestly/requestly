import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { Checkbox } from "antd";
import "./index.css";
import { RQInput } from "lib/design-system/components";
import { ActiveProps, Option, multipleChoiceOption } from "../types";

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

  const { title, type, icon } = option;
  const dispatch = useDispatch();
  const key = userPersona[fieldKey];

  const [customInput, setCustomInput] = useState<string>(null);
  const [isOptionActive, setIsOptionActive] = useState<boolean>(false);

  useEffect(() => {
    if (type === "text") {
      setIsOptionActive(
        isActive?.({
          key,
          title,
          optionType: "other",
        })
      );
    } else {
      setIsOptionActive(isActive?.({ key, title }));
    }
  }, [isActive, title, key, type]);

  useEffect(() => {
    if (type === "text") {
      const option = key.find(
        (option: multipleChoiceOption) => option.optionType === "other"
      );
      if (option) setCustomInput(option.value);
      else setCustomInput(null);
    }
  }, [fieldKey, type, key]);

  return (
    <>
      {type !== "text" ? (
        // predefined options
        <div
          className={`survey-option survey-select ${
            isOptionActive && "outline-active-option"
          }`}
          onClick={() => action(dispatch, title, isOptionActive, "select")}
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
          {questionType === "multiple" && <Checkbox checked={isOptionActive} />}
        </div>
      ) : (
        //Other: custom input option
        <div
          className={`survey-option survey-text ${
            isOptionActive && "outline-active-option"
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
              action(dispatch, title, false, "other");
            }}
          />
          <>
            {isOptionActive && (
              <Checkbox checked={true} className="survey-text-suffix" />
            )}
          </>
        </div>
      )}
    </>
  );
};
