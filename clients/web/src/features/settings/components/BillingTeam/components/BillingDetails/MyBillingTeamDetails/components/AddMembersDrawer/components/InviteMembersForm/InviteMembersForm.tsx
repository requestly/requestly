import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { getBillingTeamById } from "store/features/billing/selectors";
import EmailInputWithDomainBasedSuggestions from "components/common/EmailInputWithDomainBasedSuggestions";
import { RQButton } from "lib/design-system/components";
import { PostUserAdditionView } from "./components/PostUserAdditionView/PostUserAdditionView";
import { ExternalDomainWarningBanner } from "./components/ExternalDomainWarningBanner/ExternalDomainWarningBanner";
import { LOGGER as Logger } from "@requestly/utils";
import { inviteUsersToBillingTeam } from "backend/billing";
import { toast } from "utils/Toast";
import { getDomainFromEmail } from "utils/FormattingHelper";
import {
  trackBillingTeamInviteSendingFailed,
  trackBillingTeamInviteSentSuccessfully,
} from "features/settings/analytics";
import "./inviteMembersForm.scss";

interface InviteMembersFormProps {
  billingId: string;
  searchValue: string;
  setSearchValue: (value: string) => void;
  toggleInviteFormVisibility: () => void;
  closeAddMembersDrawer: () => void;
}

export const InviteMembersForm: React.FC<InviteMembersFormProps> = ({
  billingId,
  searchValue,
  setSearchValue,
  toggleInviteFormVisibility,
  closeAddMembersDrawer,
}) => {
  const billingTeamDetails = useSelector(getBillingTeamById(billingId));
  const [isPostUserAdditionViewVisible, setIsPostUserAdditionViewVisible] = useState(false);
  const [externalDomainEmails, setExternalDomainEmails] = useState([]);
  const [isExternalDomainWarningBannerClosed, setIsExternalDomainWarningBannerClosed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState([]);

  const handleInviteMembersToBillingTeam = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!emails.length) {
        toast.warn("Please enter email(s) to proceed");
        return;
      }

      setIsLoading(true);
      const hasExternalDomainUser = emails.some(
        (email) => !billingTeamDetails?.ownerDomains?.includes(getDomainFromEmail(email))
      );

      inviteUsersToBillingTeam(billingId, emails)
        .then(() => {
          setIsPostUserAdditionViewVisible(true);

          trackBillingTeamInviteSentSuccessfully(hasExternalDomainUser);
        })
        .catch((error) => {
          Logger.log("Error adding members to billing team", error);
          trackBillingTeamInviteSendingFailed(hasExternalDomainUser);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [billingId, emails, billingTeamDetails?.ownerDomains]
  );

  const handleEmailsChange = useCallback(
    (emails: string[]) => {
      setEmails(emails);
      const billingTeamDomains = billingTeamDetails?.ownerDomains;
      const externalDomainEmails = emails.filter((email) => !billingTeamDomains.includes(getDomainFromEmail(email)));
      setExternalDomainEmails(externalDomainEmails);
    },
    [billingTeamDetails?.ownerDomains]
  );

  if (isPostUserAdditionViewVisible) {
    return (
      <PostUserAdditionView
        toggleInviteFormVisibility={toggleInviteFormVisibility}
        closeAddMembersDrawer={closeAddMembersDrawer}
      />
    );
  } else {
    return (
      <form className="billing-team-invite-members-form-wrapper" onSubmit={handleInviteMembersToBillingTeam}>
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
          <EmailInputWithDomainBasedSuggestions
            autoFocus
            transparentBackground
            onChange={handleEmailsChange}
            defaultValue={searchValue}
          />
        </div>
        <div className="billing-team-invite-members-form-actions">
          <RQButton loading={isLoading} type="primary" htmlType="submit">
            Assign license
          </RQButton>
          <RQButton
            disabled={isLoading}
            type="default"
            onClick={() => {
              toggleInviteFormVisibility();
              setSearchValue("");
            }}
          >
            Back to members list
          </RQButton>
        </div>
      </form>
    );
  }
};
