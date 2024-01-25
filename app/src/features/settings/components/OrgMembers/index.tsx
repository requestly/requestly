import { Col } from "antd";
import { OrgMembersTable } from "../OrgMembersTable";
import "./index.scss";

export const OrgMembersView = () => {
  return (
    <>
      <Col className="my-billing-team-title">Members</Col>
      <Col className="org-members-table-wrapper">
        <OrgMembersTable actionButtons={() => null} />
      </Col>
    </>
  );
};
