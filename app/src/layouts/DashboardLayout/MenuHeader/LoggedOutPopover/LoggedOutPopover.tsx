import { Avatar, Col, Popover, Row } from "antd";
import loggedOutAvatar from "/assets/media/common/loggedout-avatar.svg";
import { LoggedOutPopoverContent } from "./LoggedOutPopoverContent";

export const LoggedOutPopover = () => {
  return (
    <Row align="middle" gutter={4}>
      <Col>
        <Popover
          overlayClassName="logged-out-popover-overlay"
          placement="bottomLeft"
          content={<LoggedOutPopoverContent />}
          showArrow={false}
          className="logged-out-popover"
        >
          <Avatar
            size={28}
            src={loggedOutAvatar}
            shape="square"
            className="cursor-pointer"
            style={{ marginTop: 2 }}
            alt="open sign in options"
          />
        </Popover>
      </Col>
    </Row>
  );
};
