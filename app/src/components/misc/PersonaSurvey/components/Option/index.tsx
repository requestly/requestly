import React from "react";
import { Checkbox } from "antd";
import "./index.css";
import { RQInput } from "lib/design-system/components";

interface OptionProps {
  title: string;
  type: string;
}

export const SurveyOption: React.FC<OptionProps> = ({ title, type }) => {
  return (
    <>
      {type === "select" ? (
        <div className="survey-option survey-select">
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
          />
          <Checkbox checked={false} className="survey-text-suffix" />
        </div>
      )}
    </>
  );
};
