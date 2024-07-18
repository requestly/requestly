import { Layout } from "antd";
import Invite from "components/misc/Invite";
import HeaderUser from "layouts/DashboardLayout/MenuHeader/HeaderUser";
import { useNavigate, useParams } from "react-router-dom";
import { redirectToRules } from "utils/RedirectionUtils";
import RQLogo from "assets/img/brand/rq_logo_full.svg";
import "./inviteView.scss";

const InviteView = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <Layout.Header className="invite-view-navbar">
        <img className="logo" src={RQLogo} alt="requestly logo" onClick={() => redirectToRules(navigate)} />
        <HeaderUser />
      </Layout.Header>
      <Invite inviteId={inviteId} />
    </>
  );
};

export default InviteView;
