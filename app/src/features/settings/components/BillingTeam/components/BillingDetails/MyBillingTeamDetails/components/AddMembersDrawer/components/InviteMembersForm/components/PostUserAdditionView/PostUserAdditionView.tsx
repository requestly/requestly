import React from "react";
import { Alert } from "antd";
import { RQButton } from "lib/design-system/components";
import LottieAnimation from "componentsV2/LottieAnimation/LottieAnimation";
import animationData from "./assets/success.json";
import "./postUserAdditionView.scss";

interface PostUserAdditionViewProps {
  nonExisitingEmails: string[];
  toggleInviteFormVisibility: () => void;
  closeAddMembersDrawer: () => void;
}

export const PostUserAdditionView: React.FC<PostUserAdditionViewProps> = ({
  nonExisitingEmails,
  toggleInviteFormVisibility,
  closeAddMembersDrawer,
}) => {
  // TODO: REMOVE THIS AFTER INVITE FLOW IS IMPLEMENTED
  const nonExistingUsersAlertContent = (
    <>
      <div>Could not find the following users, please verify the emails and try again:</div>
      <ul>
        {nonExisitingEmails.map((email) => (
          <li>{email}</li>
        ))}
      </ul>
    </>
  );

  return (
    <div className="post-user-addition-view">
      <div className="post-user-addition-animation-container">
        <LottieAnimation animationData={animationData} animationName="member added successfully" />
      </div>
      <div className="post-user-addition-view-title">All set from your end</div>
      {/* TEMP */}
      {/* TODO: REMOVE THIS AFTER INVITE FLOW IS IMPLEMENTED */}
      <div className="mt-16">
        <Alert message={nonExistingUsersAlertContent} type="warning" className="w-full" />
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
