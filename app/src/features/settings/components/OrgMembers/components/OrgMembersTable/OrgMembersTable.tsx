import React, { ReactNode, useMemo } from "react";
import { Col, Empty, Input, Row, Table, TableProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { OrgMember } from "../../types";
import "./orgMembersTable.scss";

interface OrgMembersTableProps {
  isLoading: boolean;
  searchValue: string;
  members: OrgMember[];
  setSearchValue: (value: string) => void;
  memberActions?: (record: OrgMember) => ReactNode[];
  tableActions?: ReactNode[];
  emptyView?: ReactNode;
  actions?: (member: OrgMember) => ReactNode;
}

export const OrgMembersTable: React.FC<OrgMembersTableProps> = ({
  searchValue,
  setSearchValue,
  members,
  memberActions,
  tableActions,
  isLoading,
  emptyView,
}) => {
  const columns: TableProps<OrgMember>["columns"] = useMemo(
    () => [
      {
        title: "Member",
        key: "member",
        width: 350,
        render: (_: any, member) => {
          return (
            <Row align="middle" gutter={8}>
              <Col>
                <img
                  className="org-member-avatar"
                  src={
                    member?.photoURL
                      ? member?.photoURL
                      : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                  }
                  alt={member?.email}
                />
              </Col>
              <Col className="org-member-email">{member?.email}</Col>
            </Row>
          );
        },
        defaultSortOrder: "ascend",
        showSorterTooltip: false,
        sorter: {
          compare: (a, b) => a.email.localeCompare(b.email),
        },
      },
      {
        title: "",
        key: "action",
        render: (_: any, member) => {
          return <div className="org-member-row-actions">{memberActions?.(member)}</div>;
        },
      },
    ],

    [memberActions]
  );

  return (
    <Col>
      <Col className="org-member-table">
        <Col className="org-member-table-header">
          <div className="org-members-table-header-actions">
            <Input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search members"
              className="org-member-table-header-input"
              suffix={<SearchOutlined />}
            />
            <div className="org-members-table-actions">{tableActions}</div>
          </div>
          <div className="org-members-table-count">
            {members.length} {members.length === 1 ? "member" : "members"}
          </div>
        </Col>

        <Table
          className="billing-table"
          dataSource={members}
          columns={columns}
          pagination={false}
          scroll={{ y: "78vh" }}
          loading={isLoading}
          locale={{
            emptyText: emptyView ?? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  !members?.length ? (
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
    </Col>
  );
};
