import React, { useState } from "react";
import { Col, Drawer, Dropdown, Row, Table } from "antd";
import { RQButton } from "lib/design-system/components";
import { OrgMembersTable } from "features/settings/components/OrgMembersTable";
import { MemberTableActions } from "./components/MemberTableActions";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { HiOutlineDotsHorizontal } from "@react-icons/all-files/hi/HiOutlineDotsHorizontal";
import { MdOutlineAdminPanelSettings } from "@react-icons/all-files/md/MdOutlineAdminPanelSettings";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { MdPersonOutline } from "@react-icons/all-files/md/MdPersonOutline";
import type { MenuProps } from "antd";
import "./index.scss";

export const BillingTeamMembers: React.FC = () => {
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <>{text}</>,
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: any) => (
        <Row justify="end" align="middle" gutter={8} className="w-full">
          <Col>
            <RQButton type="text" icon={<IoMdCloseCircleOutline fontSize={14} />} className="remove-member-btn">
              Remove
            </RQButton>
          </Col>
          <Col>
            <Dropdown menu={{ items }} trigger={["click"]}>
              <RQButton
                className="members-table-dropdown-btn"
                icon={<HiOutlineDotsHorizontal />}
                iconOnly
                type="text"
              />
            </Dropdown>
          </Col>
        </Row>
      ),
    },
  ];

  const items: MenuProps["items"] = [
    {
      key: "0",
      label: (
        <Row align="middle" gutter={8}>
          <MdOutlineAdminPanelSettings fontSize={16} className="mr-8" />
          Make Admin
        </Row>
      ),
    },
    {
      key: "1",
      label: (
        <Row align="middle" gutter={8}>
          <MdPersonOutline fontSize={16} className="mr-8" />
          Change role to member
        </Row>
      ),
    },
  ];

  return (
    <>
      <Col className="billing-teams-primary-card billing-team-members-section">
        <Row className="billing-team-members-section-header w-full" justify="space-between" align="middle">
          <Col className="billing-team-members-section-header-title">Members in billing team</Col>
          <Col>
            <RQButton
              type="default"
              icon={<IoMdAdd />}
              className="billing-team-members-section-header-btn"
              onClick={() => setIsMembersDrawerOpen(true)}
            >
              Add members
            </RQButton>
          </Col>
        </Row>
        <Table
          className="billing-table my-billing-team-members-table"
          dataSource={[]}
          columns={columns}
          pagination={false}
          scroll={{ y: "35vh" }}
        />
      </Col>
      <Drawer
        placement="right"
        onClose={() => setIsMembersDrawerOpen(false)}
        open={isMembersDrawerOpen}
        width={640}
        closeIcon={null}
        mask={false}
        className="billing-team-members-drawer"
      >
        <Row className="billing-team-members-drawer-header w-full" justify="space-between" align="middle">
          <Col className="billing-team-members-drawer-header_title">Add members in billing team</Col>
          <Col>
            <IoMdClose onClick={() => setIsMembersDrawerOpen(false)} />
          </Col>
        </Row>
        <Col className="billing-team-members-drawer-body">
          <OrgMembersTable actionButtons={(record: any) => <MemberTableActions record={record} />} />
        </Col>
        <Row className="mt-8 billing-team-members-drawer-help" justify="space-between" align="middle">
          <Col>
            Couldn't find member?{" "}
            <a className="external-link" href="mailto:contact@requestly.io">
              Contact us
            </a>
            , and we'll assist you in adding your team members.
          </Col>
          <Col>
            <RQButton type="primary" onClick={() => setIsMembersDrawerOpen(false)}>
              Done
            </RQButton>
          </Col>
        </Row>
      </Drawer>
    </>
  );
};
