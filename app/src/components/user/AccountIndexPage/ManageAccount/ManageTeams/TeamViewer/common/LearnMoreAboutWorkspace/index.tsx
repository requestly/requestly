import React from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import APP_CONSTANTS from "config/constants";
import "./LearnMoreAboutWorkspace.css";

interface LearnMoreAboutWorkspaceProps {
  linkText: string;
}

const LearnMoreAboutWorkspace: React.FC<LearnMoreAboutWorkspaceProps> = ({ linkText }) => {
  return (
    <div className="text-gray cursor-pointer workspace-learn-more-link-container">
      <QuestionCircleOutlined className="workspace-learn-more-icon" />
      <a
        target="_blank"
        rel="noreferrer"
        className="workspace-learn-more-link"
        href={APP_CONSTANTS.LINKS.DEMO_VIDEOS.TEAM_WORKSPACES}
      >
        {linkText}
      </a>
    </div>
  );
};

export default LearnMoreAboutWorkspace;
