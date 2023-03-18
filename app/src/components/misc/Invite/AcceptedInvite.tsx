import { RQModal } from "lib/design-system/components";
import "./index.css";

interface Props {
    inviteId: string;
    ownerName: string;
    workspaceName: string;
    invitedEmail: string;
}

const AcceptedInvite = ({ inviteId, ownerName, workspaceName, invitedEmail }: Props) => {
  return (
    <RQModal centered open={true}>
        <div className="rq-modal-content invite-modal-content">
            <div className="header invite-modal-header">
                Invitation already accepted
            </div>
            <p className="text-gray invite-modal-subheader">
                If you think this is a mistake or if you have trouble logging into the workspace, please contact the workspace admins or Requestly support.
            </p>
        </div>
    </RQModal>
  );
};

export default AcceptedInvite;
