import React from "react";
import { Row, Col } from "antd";
import { RQButton } from "lib/design-system/components";
import { SessionRecording } from "views/features/sessions/types";
import { MdOutlineShare } from "@react-icons/all-files/md/MdOutlineShare";
import { MdContentCopy } from "@react-icons/all-files/md/MdContentCopy";
import "./sessionsListItem.scss";

interface Props {
  session: SessionRecording;
}

export const SessionsListItem: React.FC<Props> = ({ session }) => {
  console.log(session);
  return (
    <Row className="session-card-list-item" justify="space-between" align="middle">
      <Col className="session-card-list-item-name">{session.name}</Col>
      <Col className="session-card-list-item-btns-wrapper">
        <RQButton type="text" iconOnly icon={<MdOutlineShare className="text-white" />} />
        <RQButton
          type="text"
          iconOnly
          icon={<MdContentCopy className="text-white" style={{ transform: "scaleY(-1)" }} />}
        />
      </Col>
    </Row>
  );
};
