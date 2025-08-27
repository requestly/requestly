import React from "react";
import { Input } from "antd";
import "./createWorkspaceHeader.scss";

interface CreateWorkspaceHeaderProps {
  title: string;
  description: string;
  onWorkspaceNameChange: (name: string) => void;
}

export const CreateWorkspaceHeader: React.FC<CreateWorkspaceHeaderProps> = ({
  title,
  description,
  onWorkspaceNameChange,
}) => {
  return (
    <div className="create-workspace-header">
      <div className="create-workspace-header__title">{title}</div>
      <div className="create-workspace-header__description">{description}</div>
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
