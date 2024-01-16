import React from "react";
import { Col, Dropdown, Row, Table } from "antd";
import { RQButton } from "lib/design-system/components";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { HiOutlineDotsHorizontal } from "@react-icons/all-files/hi/HiOutlineDotsHorizontal";
import { MdOutlineAdminPanelSettings } from "@react-icons/all-files/md/MdOutlineAdminPanelSettings";
import { MdPersonOutline } from "@react-icons/all-files/md/MdPersonOutline";
import type { MenuProps } from "antd";
import "./index.scss";

export const BillingTeamMembers: React.FC = () => {
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

  const dataSource = [
    {
      key: "1",
      name: "John Brown",
      age: 32,
      address: "New York No. 1 Lake Park",
      tags: ["nice", "developer"],
    },
    {
      key: "2",
      name: "Jim Green",
      age: 42,
      address: "London No. 1 Lake Park",
      tags: ["loser"],
    },
    {
      key: "3",
      name: "Joe Black",
      age: 32,
      address: "Sydney No. 1 Lake Park",
      tags: ["cool", "teacher"],
    },
    {
      key: "3",
      name: "Joe Black",
      age: 32,
      address: "Sydney No. 1 Lake Park",
      tags: ["cool", "teacher"],
    },
    {
      key: "3",
      name: "Joe Black",
      age: 32,
      address: "Sydney No. 1 Lake Park",
      tags: ["cool", "teacher"],
    },
    {
      key: "3",
      name: "Joe Black",
      age: 32,
      address: "Sydney No. 1 Lake Park",
      tags: ["cool", "teacher"],
    },
  ];

  return (
    <Col className="billing-teams-primary-card billing-team-members-section">
      <Row className="billing-team-members-section-header w-full" justify="space-between" align="middle">
        <Col className="billing-team-members-section-header-title">Members in billing team</Col>
        <Col>
          <RQButton type="default" icon={<IoMdAdd />} className="billing-team-members-section-header-btn">
            Add members
          </RQButton>
        </Col>
      </Row>
      <Table
        className="billing-table my-billing-team-members-table"
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        scroll={{ y: "35vh" }}
      />
    </Col>
  );
};
