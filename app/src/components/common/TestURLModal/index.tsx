import React, { useState, useEffect, useCallback } from "react";
import { useDebounce } from "hooks/useDebounce";
import { RQButton, RQModal } from "lib/design-system/components";
import { SourceUrl } from "../SourceUrl";
import { Typography, Divider, Row, Input } from "antd";
import { CheckCircleOutlined, InfoCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { isRegexFormat } from "utils/rules/misc";
import { isValidUrl } from "utils/FormattingHelper";
import { isEqual } from "lodash";
import { SourceOperator } from "types";
import { Source } from "../SourceUrl/types";
//@ts-ignore
import { RULE_PROCESSOR } from "@requestly/requestly-core";
import {
  trackURLConditionMatchingTried,
  trackURLConditionModalViewed,
  trackURLConditionSourceModificationSaved,
  trackURLConditionSourceModified,
} from "modules/analytics/events/features/testUrlModal";
import "./index.scss";

interface ModalProps {
  isOpen: boolean;
  source: Source;
  analyticsContext: string;
  onClose: (operator: SourceOperator) => void;
  onSave: (newSource: Source) => void;
}

export const TestURLModal: React.FC<ModalProps> = ({ isOpen, source, analyticsContext, onClose, onSave }) => {
  const [updatedSource, setUpdatedSource] = useState<Source>(source);
  const [testURL, setTestURL] = useState<string>("");
  const [isCheckPassed, setIsCheckPassed] = useState<boolean>(false);
  const [matchedGroups, setMatchedGroups] = useState<string[]>([]);
  const [isSourceModified, setIsSourceModified] = useState<boolean>(false);
  const [isTestURLTried, setIsTestURLTried] = useState<boolean>(false);

  const renderMatchedGroups = useCallback(() => {
    if (
      updatedSource.operator === SourceOperator.MATCHES ||
      updatedSource.operator === SourceOperator.WILDCARD_MATCHES
    ) {
      return (
        <div className="group-match-wrapper">
          {matchedGroups.map((group, index) => (
            <span>
              {group.length ? (
                <>
                  <span className="text-bold">${index + 1}</span> = {group}
                </>
              ) : null}
            </span>
          ))}
        </div>
      );
    }
  }, [matchedGroups, updatedSource.operator]);

  const renderResult = useCallback(() => {
    if (updatedSource.operator === SourceOperator.MATCHES && !isRegexFormat(updatedSource.value)) {
      return (
        <>
          <CloseCircleOutlined className="danger" />
          The regex pattern entered is <span className="danger result-text"> invalid</span>.
        </>
      );
    }
    if (!testURL) {
      return (
        <>
          <InfoCircleOutlined />
          Match information will be displayed here automatically once you enter the URL.
        </>
      );
    } else if (!isValidUrl(testURL)) {
      return (
        <>
          <CloseCircleOutlined className="danger" />
          The URL entered is <span className="danger result-text">invalid</span>.
        </>
      );
    }

    return isCheckPassed ? (
      <>
        <CheckCircleOutlined className="success" />
        The URL <span className="success result-text">matches</span> the source condition you defined.
      </>
    ) : (
      <>
        <CloseCircleOutlined className="danger" />
        The URL <span className="danger result-text"> doesn't match </span> the source condition you defined.
      </>
    );
  }, [testURL, isCheckPassed, updatedSource.value, updatedSource.operator]);

  const handleTestURL = () => {
    const result = RULE_PROCESSOR.RuleMatcher.matchUrlWithRuleSourceWithExtraInfo(updatedSource, testURL, null);
    setIsCheckPassed(result.destination === "");
    if (result.destination === "") {
      if (result.extraInfo.length) setMatchedGroups(result.extraInfo);
      else setMatchedGroups([]);
    }
  };

  const debouncedHandleTestURL = useDebounce(handleTestURL);

  const handleSourceConfigChange = (updatedSource: Source) => {
    if (!isSourceModified) {
      trackURLConditionSourceModified(analyticsContext, updatedSource.operator);
      setIsSourceModified(true);
    }
    setUpdatedSource(updatedSource);
    debouncedHandleTestURL();
  };

  const handleTestURLChange = (value: string) => {
    if (!isTestURLTried) {
      trackURLConditionMatchingTried(analyticsContext, updatedSource.operator);
      setIsTestURLTried(true);
    }
    setTestURL(value);
    debouncedHandleTestURL();
  };

  useEffect(() => {
    trackURLConditionModalViewed(analyticsContext, source.operator);
  }, [analyticsContext, source.operator]);

  return (
    <RQModal
      destroyOnClose
      centered
      open={isOpen}
      className="test-url-modal"
      width={800}
      onCancel={() => onClose(updatedSource.operator)}
    >
      <div className="test-url-modal-header">
        <Typography.Title level={4}>Test URL condition</Typography.Title>
        <Typography.Text className="text-gray">
          Check if your request URL matches the rule condition you specified.
        </Typography.Text>
      </div>
      <Divider />
      <div className="test-url-modal-body">
        <div className="text-bold white">Source condition</div>
        <div className="mt-8">
          <SourceUrl
            source={updatedSource}
            onSourceChange={(updatedSource) => handleSourceConfigChange(updatedSource)}
          />
        </div>
        <div className="test-url-modal-section">
          <div className="text-bold white"> Enter URL to be checked</div>
          <Input
            className="mt-8"
            placeholder="https://www.example.com"
            value={testURL}
            onChange={(e) => {
              handleTestURLChange(e.target.value);
            }}
          />
        </div>
        <div className="test-url-modal-section match-result">
          <div className="text-bold white">Result</div>
          <div className="mt-1 text-gray">
            <Row align="middle">{renderResult()}</Row>
            {matchedGroups.length > 0 && renderMatchedGroups()}
          </div>
        </div>
      </div>
      <div className="rq-modal-footer">
        <Row className="w-full" justify="end">
          {isEqual(source, updatedSource) ? (
            <RQButton type="default" onClick={() => onClose(updatedSource.operator)}>
              Close
            </RQButton>
          ) : (
            <RQButton
              type="primary"
              className="text-bold"
              onClick={() => {
                onSave(updatedSource);
                onClose(updatedSource.operator);
                trackURLConditionSourceModificationSaved(analyticsContext, updatedSource.operator);
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
