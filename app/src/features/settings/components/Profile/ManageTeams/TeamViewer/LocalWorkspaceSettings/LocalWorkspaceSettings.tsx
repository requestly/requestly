import React from "react";
import "./localWorkspaceSettings.scss";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { MdOutlineTipsAndUpdates } from "@react-icons/all-files/md/MdOutlineTipsAndUpdates";
import { Divider } from "antd";
import DeleteLocalWorkspaceSection from "./DeleteLocalWorkspaceSection/DeleteLocalWorkspaceSection";

interface LocalWorkspaceSettingsProps {
  workspacePath: string;
}

export const LocalWorkspaceSettings: React.FC<LocalWorkspaceSettingsProps> = ({ workspacePath }) => {
  return (
    <>
      <Divider />
      <div className="local-workspace-details-container">
        <div className="local-workspace-location-details">
          <div className="local-workspace-location-details-title">Location to store workspace data</div>
          <div className="local-workspace-details-card local-workspace-path-details-card">
            <div className="local-workspace-path-details-card-title">SELECTED LOCATION</div>
            <div className="local-workspace-path-details-card-path">{workspacePath}</div>
            <div className="local-workspace-path-details-card-info">
              <MdInfoOutline />
              Selected location can’t be changed now, but this feature is coming soon! Stay updated on{" "}
              <a href="https://github.com/requestly/requestly/issues/3136" target="_blank" rel="noreferrer">
                Github
              </a>
              .
            </div>
          </div>
        </div>
        <div className="local-workspace-details-card local-workspace-git-card">
          <div className="local-workspace-git-card-title">
            <MdOutlineTipsAndUpdates />
            Collaborate with your team using Git
          </div>
          <div className="local-workspace-git-card-description">
            Work with your team using Git to manage changes in this local file location.
          </div>
        </div>
      </div>
      <DeleteLocalWorkspaceSection />
    </>
  );
};
