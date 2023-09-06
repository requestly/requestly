import React from "react";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { ShareFromPrivate } from "./ShareFromPrivate";

interface ShareInWorkspaceProps {
  selectedRules: string[];
}

export const ShareInWorkspaces: React.FC<ShareInWorkspaceProps> = ({ selectedRules }) => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  console.log({ isWorkspaceMode, selectedRules });
  return (
    <div className="sharing-modal-body share-in-workspaces-wrapper">
      {isWorkspaceMode ? "SHARE FROM WORKSPACE SCREEN HERE" : <ShareFromPrivate selectedRules={selectedRules} />}
    </div>
  );
};
