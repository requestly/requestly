import { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import AcceptInvite from "./AcceptInvite";
import InviteNotFound from "./InviteNotFound";
import BadLoginInvite from "./BadLoginInvite";
import AcceptedInvite from "./AcceptedInvite";
import ExpiredInvite from "./ExpiredInvite";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";
import SpinnerCard from "../SpinnerCard";
import { trackWorkspaceInviteScreenError } from "modules/analytics/events/features/teams";
import "./index.css";
import { WorkspaceType } from "features/workspaces/types";

interface Props {
  inviteId: string;
}

export enum VerifyInviteErrors {
  not_logged_in = "not_logged_in",
  invalid_email = "invalid_email",
  invite_expired = "invite_expired",
  invite_not_found = "invite_not_found",
  invite_already_accepted = "invite_already_accepted",
}

const Invite = ({ inviteId }: Props) => {
  const user = useSelector(getUserAuthDetails);

  const [ownerName, setOwnerName] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [invitedEmail, setInvitedEmail] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  useEffect(() => {
    const functions = getFunctions();
    const verifyInvite = httpsCallable(functions, "invites-verifyInvite");

    setIsLoading(true);
    verifyInvite({ inviteId })
      .then((res: any) => {
        const invite = res?.data?.data?.invite;

        setOwnerName(invite?.metadata?.ownerDisplayName);
        setWorkspace({
          id: invite?.metadata?.teamId,
          name: invite?.metadata?.teamName,
          workspaceType: WorkspaceType.SHARED,
        });
        setInvitedEmail(invite?.email);

        if (res?.data?.success) {
          setVerificationSuccess(true);
        } else {
          setVerificationError(res?.data?.error as VerifyInviteErrors);
          trackWorkspaceInviteScreenError(res?.data?.error, invite?.metadata?.teamId, inviteId);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, [inviteId, user]);

  if (isLoading) {
    return <SpinnerCard customLoadingMessage="Verifying Invite" />;
  }

  if (verificationSuccess) {
    return <AcceptInvite inviteId={inviteId} ownerName={ownerName} workspace={workspace} invitedEmail={invitedEmail} />;
  }

  if (
    verificationError === VerifyInviteErrors.not_logged_in ||
    verificationError === VerifyInviteErrors.invalid_email
  ) {
    return (
      <BadLoginInvite inviteId={inviteId} ownerName={ownerName} workspace={workspace} invitedEmail={invitedEmail} />
    );
  } else if (verificationError === VerifyInviteErrors.invite_not_found) {
    return (
      <InviteNotFound
        inviteId={inviteId}
        ownerName={ownerName}
        workspaceName={workspace?.name}
        invitedEmail={invitedEmail}
      />
    );
  } else if (verificationError === VerifyInviteErrors.invite_already_accepted) {
    return (
      <AcceptedInvite
        inviteId={inviteId}
        ownerName={ownerName}
        workspaceName={workspace?.name}
        invitedEmail={invitedEmail}
      />
    );
  } else if (verificationError === VerifyInviteErrors.invite_expired) {
    return (
      <ExpiredInvite
        inviteId={inviteId}
        ownerName={ownerName}
        workspaceName={workspace?.name}
        invitedEmail={invitedEmail}
      />
    );
  }

  return (
    <InviteNotFound
      inviteId={inviteId}
      ownerName={ownerName}
      workspaceName={workspace?.name}
      invitedEmail={invitedEmail}
    />
  );
};

export default Invite;
