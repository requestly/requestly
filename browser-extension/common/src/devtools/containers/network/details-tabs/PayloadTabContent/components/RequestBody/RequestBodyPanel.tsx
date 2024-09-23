import React, { useCallback, useEffect, useState } from "react";

import { RQNetworkEvent, RuleEditorUrlFragment } from "../../../../../../types";
import { Button, Collapse, Space, Tooltip } from "antd";
import { CaretRightOutlined, EditOutlined } from "@ant-design/icons";
import RequestBody from "./RequestBody";
import {
  createRule,
  generateRuleName,
  getBaseUrl,
  isContentBodyEditable,
  isRequestBodyParseable,
} from "../../../../../../utils";
import { SourceKey, SourceOperator } from "../../../../../../../types";

interface Props {
  networkEvent: RQNetworkEvent;
}

const RequestBodyPanel: React.FC<Props> = ({ networkEvent }) => {
  const [isParsed, setIsParsed] = useState(false);

  useEffect(() => {
    setIsParsed(false);
  }, [networkEvent]);

  const editRequestBody = useCallback(() => {
    createRule(
      RuleEditorUrlFragment.REQUEST,
      (rule) => {
        const baseUrl = getBaseUrl(networkEvent.request.url);
        rule.pairs[0].source = {
          key: SourceKey.URL,
          operator: SourceOperator.CONTAINS,
          value: baseUrl,
        };
        // @ts-ignore
        rule.pairs[0].request = {
          type: "static",
          value: networkEvent.request?.postData?.text || "",
        };
        rule.name = generateRuleName("Modify Request Body");
        rule.description = `Modify Request Body of ${baseUrl}`;
      },
      ""
    );
  }, [networkEvent]);

  const renderHeader = useCallback(() => {
    if (isRequestBodyParseable(networkEvent.request.postData?.mimeType)) {
      return (
        <Space>
          <span className="collapse-header-text">Request Body</span>
          <Button
            type="text"
            onClick={(e) => {
              setIsParsed(!isParsed);
              e.stopPropagation();
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
  }, [networkEvent, isParsed]);

  const renderEditRequestBodyButton = useCallback(() => {
    if (isContentBodyEditable(networkEvent._resourceType)) {
      return (
        <Space>
          <Button
            onClick={(e) => {
              editRequestBody();
              e.stopPropagation();
            }}
            icon={<EditOutlined />}
          >
            Edit Request Body
          </Button>
        </Space>
      );
    }

    return (
      <Space>
        <Tooltip title="Only XHR/Fetch requests can be modified">
          <Button disabled icon={<EditOutlined />}>
            Edit Request Body
          </Button>
        </Tooltip>
      </Space>
    );
  }, [networkEvent]);

  if (networkEvent.request?.postData?.text) {
    return (
      // Collapse.Panel doesn't work with Fragments. They have to be directly in Collapse
      <Collapse bordered={false} expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
        <Collapse.Panel key="request-body" header={renderHeader()} extra={renderEditRequestBodyButton()}>
          <RequestBody networkEvent={networkEvent} parsed={isParsed} />
        </Collapse.Panel>
      </Collapse>
    );
  }

  return null;
};

export default RequestBodyPanel;
