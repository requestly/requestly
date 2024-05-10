import React, { useState } from "react";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { Col, Drawer, Row } from "antd";
import { AddMembersTable } from "./components/AddMembersTable/AddMembersTable";
import "./addMembersDrawer.scss";

interface AppMembersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppMembersDrawer: React.FC<AppMembersDrawerProps> = ({ isOpen, onClose }) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <Drawer
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={640}
      closeIcon={null}
      mask={false}
      className="billing-team-members-drawer"
    >
      <Row className="billing-team-members-drawer-header w-full" justify="space-between" align="middle">
        <Col className="billing-team-members-drawer-header_title">Add members in billing team</Col>
        <Col>
          <IoMdClose onClick={onClose} />
        </Col>
      </Row>
      <Col className="billing-team-members-drawer-body">
        <AddMembersTable searchValue={searchValue} setSearchValue={setSearchValue} />
      </Col>
    </Drawer>
  );
};
