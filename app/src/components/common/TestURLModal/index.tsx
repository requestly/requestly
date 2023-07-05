import React, { useState, useCallback } from "react";
import { RQButton, RQModal, RQInput } from "lib/design-system/components";
import { Typography, Divider, Row, Col, Select } from "antd";
import { CheckCircleOutlined, InfoCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { capitalize } from "lodash";
import { isRegexFormat } from "utils/rules/misc";
import { RulePairSource, SourceKey, SourceOperator } from "types";
//@ts-ignore
import { RULE_PROCESSOR } from "@requestly/requestly-core";
import "./index.scss";

interface ModalProps {
  isOpen: boolean;
  source: RulePairSource;
  onClose: () => void;
  onSave: (newSource: RulePairSource) => void;
}

export const TestURLModal: React.FC<ModalProps> = ({ isOpen, source, onClose, onSave }) => {
  const [sourceConfig, setSourceConfig] = useState<RulePairSource>(source);
  const [testURL, setTestURL] = useState<string>("");
  const [isCheckPassed, setIsCheckPassed] = useState<boolean>(false);

  const renderResult = useCallback(() => {
    if (!testURL) {
      return (
        <Row align="middle">
          <InfoCircleOutlined />
          <span className="result-text">
            Match information will be displayed here automatically once you enter the URL.
          </span>
        </Row>
      );
    }

    return isCheckPassed ? (
      <Row align="middle">
        <CheckCircleOutlined style={{ color: "var(--success)" }} />
        <span className="result-text">
          The URL <span style={{ color: "var(--success)" }}>matches</span> the source condition you defined.
        </span>
      </Row>
    ) : (
      <Row align="middle">
        <CloseCircleOutlined style={{ color: "var(--danger)" }} />
        <span className="result-text">
          The URL <span style={{ color: "var(--danger)" }}> doesn't match </span> the source condition you defined.
        </span>
      </Row>
    );
  }, [testURL, isCheckPassed]);

  const handleTestURL = (url: string) => {
    const result = RULE_PROCESSOR.RuleMatcher.matchUrlWithRuleSource(sourceConfig, url, null);
    if (result === "") setIsCheckPassed(true);
    else setIsCheckPassed(false);
  };

  const handleSourceConfigChange = (key: keyof RulePairSource, value: RulePairSource[keyof RulePairSource]) => {
    setSourceConfig((prevConfig) => ({ ...prevConfig, [key]: value }));
  };

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
            <Select
              value={sourceConfig.key}
              className="source-condition-selector cursor-pointer uppercase"
              onChange={(value) => handleSourceConfigChange("key", value)}
            >
              {Object.entries(SourceKey).map(([key, value]) => (
                <Select.Option key={value} value={value}>
                  {capitalize(value)}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col className="shrink-0">
            <Select
              value={sourceConfig.operator}
              className="source-condition-selector cursor-pointer uppercase"
              onChange={(value) => handleSourceConfigChange("operator", value)}
            >
              {Object.entries(SourceOperator).map(([key, value]) => (
                <Select.Option key={key} value={value}>
                  {capitalize(
                    value === SourceOperator.WILDCARD_MATCHES
                      ? "Wildcard"
                      : value === SourceOperator.MATCHES
                      ? "RegEx"
                      : value
                  )}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <RQInput
            className="source-url-input"
            placeholder="Enter source URL"
            value={sourceConfig.value}
            onChange={(e) => setSourceConfig((prevConfig) => ({ ...prevConfig, value: e.target.value }))}
          />
          {source.operator === SourceOperator.MATCHES && !isRegexFormat(sourceConfig.value) && (
            <div className="invalid-regex-badge">INVALID REGEX</div>
          )}
        </div>
        <div className="test-url-modal-section">
          <div className="text-bold white"> Enter URL to be checked</div>
          <RQInput
            className="mt-8"
            placeholder="https://www.example.com"
            value={testURL}
            onChange={(e) => {
              setTestURL(e.target.value);
              handleTestURL(e.target.value);
            }}
          />
        </div>
        <div className="test-url-modal-section match-result">
          <div className="text-bold white">Result</div>
          <div className="mt-1 text-gray">{renderResult()}</div>
        </div>
      </div>
      <div className="rq-modal-footer">
        <Row className="w-full" justify="end">
          {JSON.stringify(source) === JSON.stringify(sourceConfig) ? (
            <RQButton type="default" onClick={onClose}>
              Close
            </RQButton>
          ) : (
            <RQButton
              type="primary"
              className="text-bold"
              onClick={() => {
                onSave(sourceConfig);
                onClose();
              }}
            >
              Save and close
            </RQButton>
          )}
        </Row>
      </div>
    </RQModal>
  );
};
