import React from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import "./index.css";

interface LearnMoreLinkProps {
  linkText: string;
  href: string;
}

export const LearnMoreLink: React.FC<LearnMoreLinkProps> = ({ linkText, href }) => {
  return (
    <div className="text-gray cursor-pointer learn-more-link-container">
      <QuestionCircleOutlined className="learn-more-icon" />
      <a target="_blank" rel="noreferrer" className="learn-more-link" href={href}>
        {linkText}
      </a>
    </div>
  );
};
