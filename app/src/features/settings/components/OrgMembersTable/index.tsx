import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { Col, Input, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { isEmailVerified } from "utils/AuthUtils";
import { getFunctions, httpsCallable } from "firebase/functions";
import "./index.scss";

export const OrgMembersTable: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  const [organizationMembers, setOrganizationMembers] = useState([]);
  const [search, setSearch] = useState("");
  const getOrganizationUsers = useMemo(() => httpsCallable(getFunctions(), "users-getOrganizationUsers"), []);

  useEffect(() => {
    isEmailVerified(user?.details?.profile?.uid).then((result) => {
      if (result && isCompanyEmail(user?.details?.profile?.email)) {
        getOrganizationUsers({
          domain: getDomainFromEmail(user?.details?.profile?.email),
        }).then((res: any) => {
          setOrganizationMembers(res.data);
        });
      }
    });
  }, [getOrganizationUsers, user?.details?.profile?.email, user?.details?.profile?.uid]);

  console.log(organizationMembers);

  return (
    <Col className="org-member-table">
      <Col className="org-member-table-header">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members"
          className="org-member-table-header-input"
          suffix={<SearchOutlined />}
        />
      </Col>
      <Table className="billing-table" dataSource={organizationMembers} />
    </Col>
  );
};
