import { useMemo, useState } from "react";
import { Col } from "antd";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { OrgMembersTable } from "./components/OrgMembersTable/OrgMembersTable";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { capitalize } from "lodash";
import { useFetchOrgMembers } from "./hooks/useFetchOrganizationMembers";
import "./orgMembers.scss";

export const OrgMembersView = () => {
  const user = useSelector(getUserAuthDetails);
  const domain = getDomainFromEmail(user?.details?.profile?.email)?.split(".")[0];
  const { isLoading, organizationMembers } = useFetchOrgMembers();
  const [searchValue, setSearchValue] = useState("");

  const searchedMembers = useMemo(() => {
    if (!organizationMembers) return [];
    return organizationMembers?.filter((member: any) => {
      return member?.email?.includes(searchValue) && member?.email !== user?.details?.profile?.email;
    });
  }, [organizationMembers, searchValue, user?.details?.profile?.email]);

  return (
    <Col className="org-members-table-container">
      <Col className="org-members-table-wrapper">
        <Col className="my-billing-team-title" style={{ alignSelf: "start" }}>
          {capitalize(domain)} Members
        </Col>
        <div className="mt-16">
          <OrgMembersTable
            isLoading={isLoading}
            members={searchedMembers}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />
        </div>
      </Col>
    </Col>
  );
};
