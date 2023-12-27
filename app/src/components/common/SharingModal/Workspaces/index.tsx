import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { ShareFromPrivate } from "./ShareFromPrivate";
import { ShareFromWorkspace } from "./ShareFromWorkspace";
import { PostSharing } from "./PostSharing";

interface ShareInWorkspaceProps {
  selectedRules: string[];
  toggleModal: () => void;
}

export const ShareInWorkspaces: React.FC<ShareInWorkspaceProps> = ({ selectedRules, toggleModal }) => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const [postShareViewData, setPostShareViewData] = useState(null);

  return (
    <div className="sharing-modal-body share-in-workspaces-wrapper">
      {postShareViewData ? (
        <PostSharing
          postShareViewData={postShareViewData}
          setPostShareViewData={setPostShareViewData}
          toggleModal={toggleModal}
        />
      ) : (
        <>
          {isWorkspaceMode ? (
            <ShareFromWorkspace selectedRules={selectedRules} setPostShareViewData={setPostShareViewData} />
          ) : (
            <ShareFromPrivate selectedRules={selectedRules} setPostShareViewData={setPostShareViewData} />
          )}
        </>
      )}
    </div>
  );
};
