import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import { getBillingTeamById } from "store/features/billing/selectors";
import EmailInputWithDomainBasedSuggestions from "components/common/EmailInputWithDomainBasedSuggestions";
import { RQButton } from "lib/design-system/components";
import { addUsersToBillingTeam } from "backend/billing";
import { PostUserAdditionView } from "./components/PostUserAdditionView/PostUserAdditionView";
import Logger from "../../../../../../../../../../../../../common/logger";
import "./inviteMembersForm.scss";

interface InviteMembersFormProps {
  billingId: string;
  toggleInviteFormVisibility: () => void;
  closeAddMembersDrawer: () => void;
}

export const InviteMembersForm: React.FC<InviteMembersFormProps> = ({
  billingId,
  toggleInviteFormVisibility,
  closeAddMembersDrawer,
}) => {
  //   const billingTeamDetails = useSelector(getBillingTeamById(billingId));
  const [isPostUserAdditionViewVisible, setIsPostUserAdditionViewVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState([]);

  const handleAddMembersToBillingTeam = () => {
    setIsLoading(true);
    addUsersToBillingTeam(billingId, emails)
      .then(() => {
        setIsPostUserAdditionViewVisible(true);
      })
      .catch((error) => {
        Logger.log("Error adding members to billing team", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isPostUserAdditionViewVisible)
    return (
      <PostUserAdditionView
        toggleInviteFormVisibility={toggleInviteFormVisibility}
        closeAddMembersDrawer={closeAddMembersDrawer}
      />
    );
  else {
    return (
      <div className="billing-team-invite-members-form-wrapper">
        <div className="billing-team-invite-members-title">Enter email(s) to send invitation</div>
        <div className="billing-team-invite-members-instruction">
          You can invite multiple members by typing their email and pressing `Enter` key.
        </div>
        <div className="invite-emails-wrapper">
          <EmailInputWithDomainBasedSuggestions transparentBackground onChange={setEmails} />
        </div>
        <div className="billing-team-invite-members-form-actions">
          <RQButton loading={isLoading} type="primary" onClick={handleAddMembersToBillingTeam}>
            Add to billing team
          </RQButton>
          <RQButton disabled={isLoading} type="default" onClick={toggleInviteFormVisibility}>
            Back to members list
          </RQButton>
        </div>
      </div>
    );
  }
};
