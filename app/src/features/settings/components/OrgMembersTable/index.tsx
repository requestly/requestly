import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { Col, Empty, Input, Row, Table, TableProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";
import { getFunctions, httpsCallable } from "firebase/functions";
import { trackBillingTeamNoMemberFound } from "features/settings/analytics";
import { OrgTableActions } from "./components/OrgTableActions";
import "./index.scss";

export const OrgMembersTable = () => {
  const user = useSelector(getUserAuthDetails);
  const [organizationMembers, setOrganizationMembers] = useState<{ total: number; users: unknown[] }>(null);
  const [search, setSearch] = useState("");
  const getOrganizationUsers = useMemo(() => httpsCallable(getFunctions(), "users-getOrganizationUsers"), []);

  const searchedMembers = useMemo(() => {
    if (!organizationMembers?.users) return [];
    return organizationMembers?.users?.filter((member: any) => {
      return member?.email?.includes(search) && member?.email !== user?.details?.profile?.email;
    });
  }, [organizationMembers?.users, search, user?.details?.profile?.email]);

  useEffect(() => {
    if (user.loggedIn && !isCompanyEmail(user?.details?.profile?.email)) {
      trackBillingTeamNoMemberFound("personal_email");
      setOrganizationMembers({ total: 0, users: [] });
    }
    if (user?.details?.profile?.isEmailVerified && isCompanyEmail(user?.details?.profile?.email)) {
      getOrganizationUsers({
        domain: getDomainFromEmail(user?.details?.profile?.email),
      }).then((res: any) => {
        if (res.data.total <= 1) {
          trackBillingTeamNoMemberFound("no_org_member_available");
        }
        setOrganizationMembers(res.data);
      });
    }
  }, [getOrganizationUsers, user.loggedIn, user?.details?.profile?.email, user?.details?.profile?.isEmailVerified]);

  const columns: TableProps<any>["columns"] = useMemo(
    () => [
      {
        title: "Member",
        key: "member",
        width: 350,
        render: (_: any, record: any) => {
          return (
            <Row align="middle" gutter={8}>
              <Col>
                <img
                  className="org-member-avatar"
                  src={
                    record?.photoURL.length
                      ? record?.photoURL
                      : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                  }
                  alt={record?.email}
                />
              </Col>
              <Col className="org-member-email">{record?.email}</Col>
            </Row>
          );
        },
        defaultSortOrder: "ascend",
        showSorterTooltip: false,
        sorter: {
          compare: (a: any, b: any) => a.email.localeCompare(b.email),
        },
      },
      {
        title: "",
        key: "action",
        render: (_: any, record: any) => {
          return <OrgTableActions record={record} />;
        },
      },
    ],

    []
  );

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
      <Table
        className="billing-table"
        dataSource={searchedMembers}
        columns={columns}
        pagination={false}
        scroll={{ y: "74vh" }}
        loading={!organizationMembers?.users}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                !organizationMembers?.users.length ? (
                  <>
                    Couldn't find member?{" "}
                    <a className="external-link" href="mailto:contact@requestly.io">
                      Contact us
                    </a>{" "}
                    and we'll assist you in adding your team members.
                  </>
                ) : (
                  "No member found"
                )
              }
            />
          ),
        }}
      />
    </Col>
  );
};
