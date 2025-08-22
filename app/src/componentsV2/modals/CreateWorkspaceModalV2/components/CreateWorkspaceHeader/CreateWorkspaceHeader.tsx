import React from "react";
import { Input } from "antd";
import "./createWorkspaceHeader.scss";

interface CreateWorkspaceHeaderProps {
  title: string;
  description: string;
  onWorkspaceNameChange: (name: string) => void;
}

export const CreateWorkspaceHeader: React.FC<CreateWorkspaceHeaderProps> = ({ onWorkspaceNameChange }) => {
  return (
    <div className="create-workspace-header">
      <div className="create-workspace__title">Create a new local workspace</div>
      <div className="create-workspace-header__description">
        The selected folder will be used as the root of your workspace. Your APIs, variables and related metadata will
        be stored in this.
      </div>
      <label htmlFor="workspace-name" className="create-workspace-header__label">
        Workspace name
      </label>
      <Input
        id="workspace-name"
        className="create-workspace-header__input"
        onChange={(e) => onWorkspaceNameChange(e.target.value)}
      />
    </div>
  );
};
