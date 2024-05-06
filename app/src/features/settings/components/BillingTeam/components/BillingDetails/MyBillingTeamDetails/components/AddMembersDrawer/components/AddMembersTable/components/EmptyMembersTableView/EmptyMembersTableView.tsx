import React from "react";
import { RQButton } from "lib/design-system/components";
import EmptyIcon from "./assets/empty.svg";
import "./emptyMembersTableView.scss";

interface EmptyMembersTableViewProps {
  searchValue: string;
}

export const EmptyMembersTableView: React.FC<EmptyMembersTableViewProps> = ({ searchValue }) => {
  return (
    <div className="empty-members-table-view">
      <img src={EmptyIcon} alt="empty list" />
      <div className="empty-members-table-title">No user found with email “{searchValue}” in your billing team</div>
      <div className="empty-members-table-description">
        Please click the button below to invite and add members in your billing team.
      </div>
      <RQButton className="mt-24" type="primary">
        Invite & add to billing team
      </RQButton>
    </div>
  );
};
