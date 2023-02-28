import React from "react";
import { useDispatch } from "react-redux";
import { Checkbox } from "antd";
import "./index.css";
import { RQInput } from "lib/design-system/components";

interface OptionProps {
  title: string;
  type: string;
  action?: (dispatch: any, value: string) => void;
}

export const SurveyOption: React.FC<OptionProps> = ({
  title,
  type,
  action,
}) => {
  const dispatch = useDispatch();
  return (
    <>
      {type === "select" ? (
        <div
          className="survey-option survey-select"
          onClick={() => action(dispatch, title)}
        >
          <div className="white text-bold survey-option-title">{title}</div>
          <Checkbox checked={false} />
        </div>
      ) : (
        <div className="survey-option survey-text">
          <div className="white text-bold survey-text-prefix">Other:</div>
          <RQInput
            bordered={false}
            size="middle"
            placeholder="Enter your inputs here..."
            onChange={(e) => action(dispatch, e.target.value)}
          />
          <Checkbox checked={false} className="survey-text-suffix" />
        </div>
      )}
    </>
  );
};
