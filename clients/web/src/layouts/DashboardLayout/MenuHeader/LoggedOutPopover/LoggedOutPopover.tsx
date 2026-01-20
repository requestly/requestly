import { Avatar, Col, Popover, Row } from "antd";
import loggedOutAvatar from "/assets/media/common/loggedout-avatar.svg";
import { LoggedOutPopoverContent } from "./LoggedOutPopoverContent";
import { useState } from "react";

export const LoggedOutPopover = () => {
  const [isPopover, setIsPopover] = useState(false);
  return (
    <Row align="middle" gutter={4}>
      <Col>
        <Popover
          open={isPopover}
          onOpenChange={setIsPopover}
          overlayClassName="logged-out-popover-overlay"
          placement="bottomLeft"
          content={<LoggedOutPopoverContent onAuthButtonClick={() => setIsPopover(false)} />}
          showArrow={false}
          className="logged-out-popover"
          trigger={["click"]}
        >
          <Avatar
            size={28}
            src={loggedOutAvatar}
            shape="square"
            className="cursor-pointer"
            style={{ marginTop: "-2px" }}
            alt="open sign in options"
          />
        </Popover>
      </Col>
    </Row>
  );
};
