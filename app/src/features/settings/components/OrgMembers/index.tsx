import { Col } from "antd";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { OrgMembersTable } from "../OrgMembersTable";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { capitalize } from "lodash";
import "./index.scss";

export const OrgMembersView = () => {
  const user = useSelector(getUserAuthDetails);
  const domain = getDomainFromEmail(user?.details?.profile?.email)?.split(".")[0];

  return (
    <>
      <Col className="my-billing-team-title">{capitalize(domain)} Members</Col>
      <Col className="org-members-table-wrapper">
        <OrgMembersTable />
      </Col>
    </>
  );
};
