import React, { useState, useEffect, useCallback, useRef } from "react";
import { RQButton, RQModal } from "lib/design-system/components";
import { Typography, Divider, Row, Col, Select, Input } from "antd";
import { CheckCircleOutlined, InfoCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { capitalize } from "lodash";
import { isRegexFormat } from "utils/rules/misc";
import type { InputRef } from "antd";
import { SourceKey, SourceOperator } from "types";
//@ts-ignore
import { RULE_PROCESSOR } from "@requestly/requestly-core";
import "./index.scss";
import {
  trackURLConditionMatchingTried,
  trackURLConditionModalViewed,
  trackURLConditionSourceModified,
} from "modules/analytics/events/features/testUrlModal";

type Source = {
  key: SourceKey[keyof SourceKey];
  operator: SourceKey[keyof SourceOperator];
  value: string;
};

interface ModalProps {
  isOpen: boolean;
  source: Source;
  analyticsContext: string;
  onClose: () => void;
  onSave: (newSource: Source) => void;
}

export const TestURLModal: React.FC<ModalProps> = ({ isOpen, source, analyticsContext, onClose, onSave }) => {
  const [sourceConfig, setSourceConfig] = useState<Source>(source);
  const [testURL, setTestURL] = useState<string>("");
  const [isCheckPassed, setIsCheckPassed] = useState<boolean>(false);
  const [isSourceModified, setIsSourceModified] = useState<boolean>(false);
  const [isTestURLTried, setIsTestURLTried] = useState<boolean>(false);

  const timerRef = useRef(null);
  const urlInputRef = useRef<InputRef>(null);
  const sourceInputRef = useRef<InputRef>(null);

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

  const handleTestURL = (
    url: string,
    newValue: string = null,
    newOperator: Source[keyof Source] = null,
    newKey: Source[keyof Source] = null
  ) => {
    const config = {
      value: newValue ?? sourceConfig.value,
      operator: newOperator ?? sourceConfig.operator,
      key: newKey ?? sourceConfig.key,
    };
    const result = RULE_PROCESSOR.RuleMatcher.matchUrlWithRuleSource(config, url, null);
    setIsCheckPassed(result === "");
  };

  const handleSourceConfigChange = (key: keyof Source, value: Source[keyof Source]) => {
    setSourceConfig((prevConfig) => ({ ...prevConfig, [key]: value }));
    setIsSourceModified(true);
  };

  const handleSourceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearTimeout(timerRef.current);
    setSourceConfig((prevConfig) => ({ ...prevConfig, value: e.target.value }));
    setIsSourceModified(true);
    timerRef.current = setTimeout(() => {
      handleTestURL(testURL, sourceInputRef.current.input.value);
    }, 500);
  };

  const handleTestURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearTimeout(timerRef.current);
    setTestURL(e.target.value);
    setIsTestURLTried(true);
    timerRef.current = setTimeout(() => {
      handleTestURL(urlInputRef.current.input.value);
    }, 500);
  };

  useEffect(() => {
    trackURLConditionModalViewed(analyticsContext, source.operator);
  }, [analyticsContext, source.operator]);

  useEffect(() => {
    if (isSourceModified) {
      trackURLConditionSourceModified(analyticsContext, source.operator);
    }
  }, [analyticsContext, source.operator, isSourceModified]);

  useEffect(() => {
    if (isTestURLTried) {
      trackURLConditionMatchingTried(analyticsContext, source.operator);
    }
  }, [isTestURLTried, analyticsContext, source.operator]);

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
              onChange={(value) => {
                handleSourceConfigChange("key", value);
                handleTestURL(testURL, null, null, value);
              }}
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
              className="source-condition-selector cursor-pointer"
              onChange={(value) => {
                handleSourceConfigChange("operator", value);
                handleTestURL(testURL, null, value, null);
              }}
            >
              {Object.entries(SourceOperator).map(([key, value]) => (
                <Select.Option key={key} value={value}>
                  {value === SourceOperator.WILDCARD_MATCHES
                    ? "Wildcard"
                    : value === SourceOperator.MATCHES
                    ? "RegEx"
                    : value}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Input
            className="source-url-input"
            placeholder="Enter source URL"
            value={sourceConfig.value}
            ref={sourceInputRef}
            onChange={handleSourceInputChange}
          />
          {sourceConfig.operator === SourceOperator.MATCHES && !isRegexFormat(sourceConfig.value) && (
            <div className="invalid-regex-badge">INVALID REGEX</div>
          )}
        </div>
        <div className="test-url-modal-section">
          <div className="text-bold white"> Enter URL to be checked</div>
          <Input
            className="mt-8"
            placeholder="https://www.example.com"
            value={testURL}
            ref={urlInputRef}
            onChange={handleTestURLChange}
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
