import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { RQButton, RQModal, RQInput } from "lib/design-system/components";
import { Typography, Divider, Row, Col, Select, Tooltip } from "antd";
import { CheckCircleOutlined, InfoCircleOutlined, CloseCircleOutlined, ExclamationOutlined } from "@ant-design/icons";
import { capitalize } from "lodash";
import { isRegexFormat } from "utils/rules/misc";
import { SourceKey, SourceOperator } from "types";
//@ts-ignore
import { RULE_PROCESSOR } from "@requestly/requestly-core";
import "./index.scss";

interface ModalProps {
  isOpen: boolean;
  source: string;
  sourceConfig: { key: string; operator: string };
  onClose: () => void;
}

export const TestURLModal: React.FC<ModalProps> = ({ isOpen, onClose, source, sourceConfig }) => {
  const [sourceCondition, setSourceCondition] = useState<string>(source);
  const [testURL, setTestURL] = useState<string>("");
  const [isCheckPassed, setIsCheckPassed] = useState<boolean>(false);
  const ruleData = useSelector(getCurrentlySelectedRuleData);

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
    const ruleProcessor = RULE_PROCESSOR.getInstance(ruleData.ruleType);
    const processedURL = ruleProcessor.process({
      rule: ruleData,
      requestURL: url,
      originalHeaders: [],
      typeOfHeaders: "Request",
    });
    console.log({ processedURL, ruleData });

    if (processedURL) setIsCheckPassed(true);
    else setIsCheckPassed(false);
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
              //   onChange={(value) => handlePageSourceDetailsChange("key", value)}
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
              className="source-condition-selector 6px cursor-pointer uppercase"
              //   onChange={(value) => handlePageSourceDetailsChange("operator", value)}
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
            value={sourceCondition}
            onChange={(e) => setSourceCondition(e.target.value)}
          />
          {sourceConfig.operator === SourceOperator.MATCHES && !isRegexFormat(sourceCondition) && (
            <Tooltip title="Invalid pattern">
              <ExclamationOutlined className="invalid-regex-icon" />
            </Tooltip>
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
          <RQButton type="default" onClick={onClose}>
            Close
          </RQButton>
        </Row>
      </div>
    </RQModal>
  );
};
