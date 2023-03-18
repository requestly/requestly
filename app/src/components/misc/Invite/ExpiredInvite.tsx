import { Col, Row } from "antd";
import "./index.css";

interface Props {
    inviteId: string;
    ownerName: string;
    workspaceName: string;
    invitedEmail: string;
}

const ExpiredInvite = ({ inviteId, ownerName, workspaceName, invitedEmail }: Props) => {
  return (
        <Row className="invite-container" justify={"center"}>
            <Col
            xs={18}
            sm={16}
            md={14}
            lg={12}
            xl={8}
            >
                <div className="invite-content">
                    <div className="header invite-header">
                        Invitation expired
                    </div>
                    <p className="text-gray invite-subheader">
                        If you think this is a mistake or if you have trouble logging into the workspace, please contact the workspace admins or Requestly support.
                    </p>
                </div>
            </Col>
        </Row>
  );
};

export default ExpiredInvite;
