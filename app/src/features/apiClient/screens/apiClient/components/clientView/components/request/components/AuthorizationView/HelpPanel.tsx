import React from "react";
import { LABEL_TEXT } from "./authConstants";
import { AuthDescriptionData } from "./types";
import { AiOutlineExclamationCircle } from "@react-icons/all-files/ai/AiOutlineExclamationCircle";
interface HelpPanelProps {
  data: AuthDescriptionData;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ data }) => {
  const { subHeading, externalLink } = data;

  return (
    <div className={`auth-help-panel`}>
      <AiOutlineExclamationCircle className="info-icon" />

      <div className="sub-heading">
        {subHeading}
        {externalLink && (
          <a href={externalLink} target="__blank" className="link-text">
            <span>{LABEL_TEXT.LEARN_MORE}</span>
          </a>
        )}
      </div>
    </div>
  );
};
