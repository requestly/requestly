import React, { useMemo } from "react";
import { RQButton, RQModal, RQDropdown, RQInput } from "lib/design-system/components";
import { Typography, Divider, Row, Menu, Col } from "antd";
import { DownOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { capitalize } from "lodash";
import { SourceKey, SourceOperator } from "types";
import "./index.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestURLModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const renderSourceKeys = useMemo(() => {
    return (
      <Menu>
        {Object.entries(SourceKey).map(([key, value]) => (
          <Menu.Item key={key}>{capitalize(value)}</Menu.Item>
        ))}
      </Menu>
    );
  }, []);

  const renderSourceOperators = useMemo(() => {
    return (
      <Menu>
        {Object.entries(SourceOperator).map(([key, value]) => (
          <Menu.Item key={key}>
            {capitalize(
              value === SourceOperator.WILDCARD_MATCHES
                ? "Wildcard"
                : value === SourceOperator.MATCHES
                ? "RegEx"
                : value
            )}
          </Menu.Item>
        ))}
      </Menu>
    );
  }, []);

  return (
    <RQModal centered open={isOpen} className="test-url-modal" width={800} onCancel={onClose}>
      <div className="test-url-modal-header">
        <Typography.Title level={4}>Test URL condition</Typography.Title>
        <Typography.Text className="text-gray">
          Check if your request URL matches the rule condition you specified.
        </Typography.Text>
      </div>
      <Divider />
      <div className="test-url-modal-body">
        <div className="text-bold white">Source condition</div>
        <div className="source-condition-input-wrapper mt-8">
          <Col className="shrink-0">
            <RQDropdown overlay={renderSourceKeys}>
              <Typography.Text
                strong
                className="source-condition-dropdown cursor-pointer uppercase"
                onClick={(e) => e.preventDefault()}
              >
                URL <DownOutlined />
              </Typography.Text>
            </RQDropdown>
          </Col>
          <Col className="shrink-0">
            <RQDropdown overlay={renderSourceOperators}>
              <Typography.Text
                strong
                className="source-condition-dropdown cursor-pointer"
                onClick={(e) => e.preventDefault()}
              >
                Contains <DownOutlined />
              </Typography.Text>
            </RQDropdown>
          </Col>
          <RQInput className="source-url-input" placeholder="Enter source URL" />
        </div>
        <div className="test-url-modal-section">
          <div className="text-bold white"> Enter URL to be checked</div>
          <RQInput className="mt-8" placeholder="https://www.example.com" />
        </div>
        <div className="test-url-modal-section">
          <div className="text-bold white">Result</div>
          <div className="mt-1 text-gray">
            <InfoCircleOutlined /> Match information will be displayed here automatically once you enter the URL.
          </div>
        </div>
      </div>
      <div className="rq-modal-footer">
        <Row className="w-full" justify="end">
          <RQButton type="default" onClick={onClose}>
            Close
          </RQButton>
        </Row>
      </div>
    </RQModal>
  );
};
