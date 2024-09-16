import React from "react";
import { RQButton } from "lib/design-system/components";
import LottieAnimation from "componentsV2/LottieAnimation/LottieAnimation";
import animationData from "./assets/success.json";
import "./postUserAdditionView.scss";

interface PostUserAdditionViewProps {
  toggleInviteFormVisibility: () => void;
  closeAddMembersDrawer: () => void;
}

export const PostUserAdditionView: React.FC<PostUserAdditionViewProps> = ({
  toggleInviteFormVisibility,
  closeAddMembersDrawer,
}) => {
  return (
    <div className="post-user-addition-view">
      <div className="post-user-addition-animation-container">
        <LottieAnimation animationData={animationData} animationName="member added successfully" />
      </div>
      <div className="post-user-addition-view-title">All set from your end</div>
      <div className="post-user-addition-view-description">
        Users have been notified via email that you have assigned them a license.
      </div>
      <div className="post-user-addition-view-actions">
        <RQButton type="primary" onClick={toggleInviteFormVisibility}>
          Back to members list
        </RQButton>
        <RQButton
          type="text"
          onClick={() => {
            toggleInviteFormVisibility();
            closeAddMembersDrawer();
          }}
        >
          Close
        </RQButton>
      </div>
    </div>
  );
};
