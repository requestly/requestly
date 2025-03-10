import React from "react";
import { Col, Select, Input } from "antd";
import { capitalize } from "lodash";
import { SessionRecordingPageSource } from "types";
import "./index.scss";
import { RulePairSource, RuleSourceKey, RuleSourceOperator } from "@requestly/shared/types/entities/rules";

type Source = RulePairSource | SessionRecordingPageSource;

interface SourceProps {
  disabled?: boolean;
  source: Source;
  autoFocus?: boolean;
  additionalActions?: React.ReactNode;
  onSourceChange: (updatedSource: Source) => void;
}

export const SourceConditionInput: React.FC<SourceProps> = ({
  source,
  autoFocus = false,
  disabled = false,
  additionalActions = <></>,
  onSourceChange,
}) => {
  return (
    <div className="source-condition-input-wrapper mt-8">
      <Col className="shrink-0 source-condition-input-select">
        <Select
          disabled={disabled}
          value={source.key}
          className="source-condition-selector cursor-pointer uppercase"
          onChange={(value) => {
            onSourceChange({ ...source, key: value });
          }}
        >
          {Object.entries(RuleSourceKey).map(([key, value]) =>
            value === RuleSourceKey.PATH ? null : (
              <Select.Option key={String(value)} value={value}>
                {capitalize(String(value))}
              </Select.Option>
            )
          )}
        </Select>
      </Col>
      <Col className="shrink-0 source-condition-input-select">
        <Select
          disabled={disabled}
          value={source.operator}
          className="source-condition-selector cursor-pointer"
          onChange={(value) => {
            onSourceChange({ ...source, operator: value });
          }}
        >
          {Object.entries(RuleSourceOperator).map(([key, value]) => (
            <Select.Option key={key} value={value}>
              {value === RuleSourceOperator.WILDCARD_MATCHES
                ? "Wildcard"
                : value === RuleSourceOperator.MATCHES
                ? "RegEx"
                : String(value)}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Input
        disabled={disabled}
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
