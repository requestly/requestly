import React, { useEffect, useRef } from "react";
import { Input, InputRef } from "antd";
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
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="create-workspace-header">
      <div className="create-workspace-header__title">{title}</div>
      <div className="create-workspace-header__description">{description}</div>
      <label htmlFor="workspace-name" className="create-workspace-header__label">
        Workspace name
      </label>
      <Input
        ref={inputRef}
        autoFocus
        id="workspace-name"
        className="create-workspace-header__input"
        onChange={(e) => onWorkspaceNameChange(e.target.value)}
      />
    </div>
  );
};
