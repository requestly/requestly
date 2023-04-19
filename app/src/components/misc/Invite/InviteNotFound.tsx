import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { useNavigate } from "react-router-dom";
import "./index.css";

interface Props {
  inviteId: string;
  ownerName: string;
  workspaceName: string;
  invitedEmail: string;
}

const InviteNotFound = ({ inviteId, ownerName, workspaceName, invitedEmail }: Props) => {
  const navigate = useNavigate();

  return (
    <Row className="invite-container" justify={"center"}>
      <Col xs={18} sm={16} md={14} lg={12} xl={8}>
        <div className="invite-content">
          <div className="header invite-header">Invitation not found</div>
          <p className="text-gray invite-subheader">
            If you think this is a mistake or if you have trouble logging into the workspace, please contact the
            workspace admins or Requestly support.
          </p>
        </div>
        <div className="invite-footer">
          <RQButton className="invite-button" type="primary" size="middle" onClick={() => navigate("/")}>
            Go Back
          </RQButton>
        </div>
      </Col>
    </Row>
  );
};

export default InviteNotFound;
