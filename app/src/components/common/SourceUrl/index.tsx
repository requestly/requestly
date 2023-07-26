import React from "react";
import { Col, Select, Input } from "antd";
import { capitalize } from "lodash";
import { RulePairSource, SourceKey, SourceOperator } from "types/rules";
import { SessionRecordingPageSource } from "types";
import "./index.scss";

type Source = RulePairSource | SessionRecordingPageSource;

interface SourceProps {
  source: Source;
  autoFocus?: boolean;
  additionalActions?: React.ReactNode;
  onSourceChange: (updatedSource: Source) => void;
}

export const SourceConditionInput: React.FC<SourceProps> = ({
  source,
  autoFocus = false,
  additionalActions = <></>,
  onSourceChange,
}) => {
  return (
    <div className="source-condition-input-wrapper mt-8">
      <Col className="shrink-0 source-condition-input-select">
        <Select
          value={source.key}
          className="source-condition-selector cursor-pointer uppercase"
          onChange={(value) => {
            onSourceChange({ ...source, key: value });
          }}
        >
          {Object.entries(SourceKey).map(([key, value]) => (
            <Select.Option key={value} value={value}>
              {capitalize(value)}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col className="shrink-0 source-condition-input-select">
        <Select
          value={source.operator}
          className="source-condition-selector cursor-pointer"
          onChange={(value) => {
            onSourceChange({ ...source, operator: value });
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
        autoFocus={autoFocus}
        className="source-url-input"
        placeholder="Enter source URL"
        value={source.value}
        onChange={(e) => {
          onSourceChange({ ...source, value: e.target.value });
        }}
      />

      {additionalActions}
    </div>
  );
};
