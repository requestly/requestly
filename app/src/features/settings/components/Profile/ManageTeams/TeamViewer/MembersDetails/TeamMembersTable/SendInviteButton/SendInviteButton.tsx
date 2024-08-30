import React, { useState } from "react";
import { RQButton } from "lib/design-system/components";
import "./sendInviteButton.scss";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";

interface SendInviteButtonProps {
  email: string;
  teamId: string;
  role: string;
  teamName: string;
  accessCount: number;
  onInvite: () => void;
  source: string;
}

export const SendInviteButton: React.FC<SendInviteButtonProps> = ({
  email,
  onInvite,
  teamId,
  role,
  teamName,
  accessCount,
  source,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteSent, setIsInviteSent] = useState(false);

  const handleInvite = async () => {
    const functions = getFunctions();
    const createTeamInvites = httpsCallable(functions, "invites-createTeamInvites");
    setIsLoading(true);

    createTeamInvites({
      teamId: teamId,
      emails: [email],
      role: role,
      teamName: teamName,
      numberOfMembers: accessCount,
      source,
    })
      .then((res) => {
        setIsLoading(false);
        onInvite();
        toast.success("Invite sent successfully");
        setIsInviteSent(true);
      })
      .catch((err) => {
        setIsLoading(false);
        toast.error("Something went wrong, please try again later");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  if (!isInviteSent) {
    return (
      <RQButton type="link" size="small" className="send-invite-button" loading={isLoading} onClick={handleInvite}>
        Send Invite
      </RQButton>
    );
  }
};
