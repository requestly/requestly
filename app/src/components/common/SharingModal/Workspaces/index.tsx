import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { ShareFromPrivate } from "./ShareFromPrivate";
import { PostSharing } from "./PostSharing";

interface ShareInWorkspaceProps {
  selectedRules: string[];
  toggleModal: () => void;
}

export const ShareInWorkspaces: React.FC<ShareInWorkspaceProps> = ({ selectedRules, toggleModal }) => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const [postShareData, setPostShareData] = useState(null);

  return (
    <div className="sharing-modal-body share-in-workspaces-wrapper">
      {postShareData ? (
        <PostSharing postShareData={postShareData} setPostShareData={setPostShareData} toggleModal={toggleModal} />
      ) : (
        <>
          {isWorkspaceMode ? (
            "SHARE FROM WORKSPACE SCREEN HERE"
          ) : (
            <ShareFromPrivate selectedRules={selectedRules} setPostShareData={setPostShareData} />
          )}
        </>
      )}
    </div>
  );
};
