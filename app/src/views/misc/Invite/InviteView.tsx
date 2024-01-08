import { Col, Layout, Row } from "antd";
import Invite from "components/misc/Invite";
import HeaderUser from "layouts/DashboardLayout/MenuHeader/HeaderUser";
import { useNavigate, useParams } from "react-router-dom";
import { redirectToRules } from "utils/RedirectionUtils";
import RQLogo from "assets/img/brand/rq_logo_full.svg";

const InviteView = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();

  return (
    <>
      <Layout.Header className="pricing-navbar">
        <Row className="w-full" justify="space-between" align="middle">
          <Col>
            <img className="logo" src={RQLogo} alt="requestly logo" onClick={() => redirectToRules(navigate)} />
          </Col>
          <HeaderUser />
        </Row>
      </Layout.Header>
      <Invite inviteId={inviteId} />
    </>
  );
};

export default InviteView;
