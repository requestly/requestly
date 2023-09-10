import React, { useState } from "react";

import { NetworkEvent } from "../../../../../../types";
import { Button, Collapse, Space } from "antd";
import { CaretRightOutlined, EditOutlined } from "@ant-design/icons";
import RequestBody from "./RequestBody";
import { isRequestBodyParseable } from "../../../../../../utils";

interface Props {
  networkEvent: NetworkEvent;
}

const RequestBodyPanel: React.FC<Props> = ({ networkEvent }) => {
  const [isParsed, setIsParsed] = useState(false);

  const renderHeader = () => {
    if (isRequestBodyParseable(networkEvent.request.postData?.mimeType)) {
      return (
        <Space>
          <span className="collapse-header-text">Request Body</span>
          <Button
            type="text"
            onClick={(e) => {
              e.stopPropagation();
              setIsParsed(!isParsed);
            }}
          >
            {isParsed ? "view source" : "view parsed"}
          </Button>
        </Space>
      );
    }

    return (
      <Space>
        <span className="collapse-header-text">Request Body</span>
      </Space>
    );
  };

  return (
    // Collapse.Panel doesn't work with Fragments. They have to be directly in Collapse
    <Collapse bordered={false} expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
      <Collapse.Panel
        key="request-body"
        header={renderHeader()}
        extra={
          <Space>
            <Button icon={<EditOutlined />}>Edit Request Body</Button>
          </Space>
        }
      >
        <RequestBody networkEvent={networkEvent} parsed={isParsed} />
      </Collapse.Panel>
    </Collapse>
  );
};

export default RequestBodyPanel;
