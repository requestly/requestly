import React from "react";
import { RQButton } from "lib/design-system/components";
import { trackBillingTeamInviteMemberClicked } from "features/settings/analytics";
import "./emptyMembersTableView.scss";

interface EmptyMembersTableViewProps {
  searchValue: string;
  toggleInviteFormVisibility: () => void;
}

export const EmptyMembersTableView: React.FC<EmptyMembersTableViewProps> = ({
  searchValue,
  toggleInviteFormVisibility,
}) => {
  return (
    <div className="empty-members-table-view">
      <img src={"/assets/media/settings/empty.svg"} alt="empty list" />
      <div className="empty-members-table-title">
        {searchValue.length
          ? `No user found with email “${searchValue}” in your billing team`
          : "You are the first one from your organization"}
      </div>
      <div className="empty-members-table-description">
        Please click the button below to invite and add members in your billing team.
      </div>
      <RQButton
        className="mt-24"
        type="primary"
        onClick={() => {
          toggleInviteFormVisibility();
          trackBillingTeamInviteMemberClicked("member_not_found");
        }}
      >
        Invite & assign license
      </RQButton>
    </div>
  );
};
