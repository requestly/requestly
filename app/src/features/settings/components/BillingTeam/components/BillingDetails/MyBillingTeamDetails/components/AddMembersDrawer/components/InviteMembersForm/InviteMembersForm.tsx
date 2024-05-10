import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { getBillingTeamById } from "store/features/billing/selectors";
import EmailInputWithDomainBasedSuggestions from "components/common/EmailInputWithDomainBasedSuggestions";
import { RQButton } from "lib/design-system/components";
import { addUsersToBillingTeam } from "backend/billing";
import { PostUserAdditionView } from "./components/PostUserAdditionView/PostUserAdditionView";
import { ExternalDomainWarningBanner } from "./components/ExternalDomainWarningBanner/ExternalDomainWarningBanner";
import Logger from "../../../../../../../../../../../../../common/logger";
import "./inviteMembersForm.scss";
import { toast } from "utils/Toast";

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
  const billingTeamDetails = useSelector(getBillingTeamById(billingId));
  const [isPostUserAdditionViewVisible, setIsPostUserAdditionViewVisible] = useState(false);
  const [externalDomainEmails, setExternalDomainEmails] = useState([]);
  const [isExternalDomainWarningBannerClosed, setIsExternalDomainWarningBannerClosed] = useState(false);
  const [nonExisitingEmails, setNonExisitingEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState([]);

  const handleAddMembersToBillingTeam = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!emails.length) {
        toast.warn("Please enter email(s) to send invitation/add users");
        return;
      }
      setIsLoading(true);
      addUsersToBillingTeam(billingId, emails)
        .then((res: any) => {
          setIsPostUserAdditionViewVisible(true);
          if (res.data.result?.failedEmails.length) {
            setNonExisitingEmails(res.data.result.failedEmails);
          }
        })
        .catch((error) => {
          Logger.log("Error adding members to billing team", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [billingId, emails]
  );

  const handleEmailsChange = useCallback(
    (emails: string[]) => {
      setEmails(emails);
      const billingTeamDomain = billingTeamDetails?.ownerDomain;
      const externalDomainEmails = emails.filter((email) => !email.includes(billingTeamDomain));
      setExternalDomainEmails(externalDomainEmails);
    },
    [billingTeamDetails?.ownerDomain]
  );

  if (isPostUserAdditionViewVisible) {
    return (
      <PostUserAdditionView
        toggleInviteFormVisibility={toggleInviteFormVisibility}
        closeAddMembersDrawer={closeAddMembersDrawer}
        nonExisitingEmails={nonExisitingEmails}
      />
    );
  } else {
    return (
      <form className="billing-team-invite-members-form-wrapper" onSubmit={handleAddMembersToBillingTeam}>
        {externalDomainEmails.length && !isExternalDomainWarningBannerClosed ? (
          <ExternalDomainWarningBanner
            emails={externalDomainEmails}
            onBannerClose={() => setIsExternalDomainWarningBannerClosed(true)}
          />
        ) : null}
        <div className="billing-team-invite-members-title">Enter email(s) to send invitation</div>
        <div className="billing-team-invite-members-instruction">
          You can invite multiple members by typing their email and pressing `Enter` key.
        </div>
        <div className="invite-emails-wrapper">
          <EmailInputWithDomainBasedSuggestions transparentBackground onChange={handleEmailsChange} />
        </div>
        <div className="billing-team-invite-members-form-actions">
          <RQButton loading={isLoading} type="primary" htmlType="submit">
            Add to billing team
          </RQButton>
          <RQButton disabled={isLoading} type="default" onClick={toggleInviteFormVisibility}>
            Back to members list
          </RQButton>
        </div>
      </form>
    );
  }
};
