import Invite from "components/misc/Invite";
import { useParams } from "react-router-dom";

const InviteView = () => {
  const { inviteId } = useParams();

  return (
    <>
      <Invite inviteId={inviteId} />
    </>
  );
};

export default InviteView;
