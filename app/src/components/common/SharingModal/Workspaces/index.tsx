import React from "react";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { ShareFromPrivate } from "./ShareFromPrivate";

export const ShareInWorkspaces: React.FC = () => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  console.log({ isWorkspaceMode });
  return (
    <div className="sharing-modal-body share-in-workspaces-wrapper">
      {isWorkspaceMode ? "SHARE FROM WORKSPACE SCREEN HERE" : <ShareFromPrivate />}
    </div>
  );
};
