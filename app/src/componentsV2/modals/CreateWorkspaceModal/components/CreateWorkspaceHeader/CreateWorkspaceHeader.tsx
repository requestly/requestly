import React, { useEffect, useRef } from "react";
import { Input, InputRef } from "antd";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import "./createWorkspaceHeader.scss";

interface CreateWorkspaceHeaderProps {
  title: string;
  description: string;
  hasDuplicateWorkspaceName: boolean;
  onWorkspaceNameChange: (name: string) => void;
}

export const CreateWorkspaceHeader: React.FC<CreateWorkspaceHeaderProps> = ({
  title,
  description,
  hasDuplicateWorkspaceName,
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
        status={hasDuplicateWorkspaceName ? "error" : undefined}
      />
      {hasDuplicateWorkspaceName ? (
        <div className="create-workspace-header__input-error-message">
          <MdInfoOutline />
          Folder already exists. Use a different name or rename the existing folder.
        </div>
      ) : null}
    </div>
  );
};
