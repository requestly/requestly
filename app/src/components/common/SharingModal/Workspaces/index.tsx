import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ShareFromPrivate } from "./ShareFromPrivate";
import { ShareFromWorkspace } from "./ShareFromWorkspace";
import { PostSharing } from "./PostSharing";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";

interface ShareInWorkspaceProps {
  selectedRules: string[];
  toggleModal: () => void;
  onRulesShared?: () => void;
}

export const ShareInWorkspaces: React.FC<ShareInWorkspaceProps> = ({
  selectedRules,
  toggleModal,
  onRulesShared = () => {},
}) => {
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
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
          {isSharedWorkspaceMode ? (
            <ShareFromWorkspace
              selectedRules={selectedRules}
              setPostShareViewData={setPostShareViewData}
              onRulesShared={onRulesShared}
            />
          ) : (
            <ShareFromPrivate
              selectedRules={selectedRules}
              setPostShareViewData={setPostShareViewData}
              onRulesShared={onRulesShared}
            />
          )}
        </>
      )}
    </div>
  );
};
