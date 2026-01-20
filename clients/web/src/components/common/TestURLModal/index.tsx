import React, { useState, useEffect, useCallback } from "react";
import { useDebounce } from "hooks/useDebounce";
import { RQButton, RQModal } from "lib/design-system/components";
import { SourceConditionInput } from "../SourceUrl";
import { Typography, Divider, Row, Input } from "antd";
import { CheckCircleOutlined, InfoCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { isValidRegex } from "utils/rules/misc";
import { isValidUrl } from "utils/FormattingHelper";
import { isEqual } from "lodash";
import { SessionRecordingPageSource } from "types/sessionRecording";
//@ts-ignore
import { RULE_PROCESSOR } from "@requestly/core";
import LINKS from "config/constants/sub/links";
import {
  trackURLConditionMatchingTried,
  trackURLConditionModalViewed,
  trackURLConditionSourceModificationSaved,
  trackURLConditionSourceModified,
} from "modules/analytics/events/features/testUrlModal";
import "./index.scss";
import { RulePairSource, RuleSourceOperator } from "@requestly/shared/types/entities/rules";

type Source = RulePairSource | SessionRecordingPageSource;

interface ModalProps {
  isOpen: boolean;
  source: Source;
  analyticsContext: Record<string, string>;
  originalSource: Source;
  defaultTestURL?: string;
  onClose: (operator: RuleSourceOperator) => void;
  onSave: (newSource: Source) => void;
}

export const TestURLModal: React.FC<ModalProps> = ({
  isOpen,
  /*
  originalSource is the source config in redux at the time of opening the modal
  source is the config passed explicitly for sample regex
  */
  source,
  originalSource,
  analyticsContext,
  defaultTestURL = "",
  onClose,
  onSave,
}) => {
  const [updatedSource, setUpdatedSource] = useState<Source>(source || originalSource);
  const [testURL, setTestURL] = useState<string>(defaultTestURL);
  const [isCheckPassed, setIsCheckPassed] = useState<boolean>(false);
  const [matchedGroups, setMatchedGroups] = useState<string[]>([]);
  const [isSourceModified, setIsSourceModified] = useState<boolean>(false);
  const [isTestURLTried, setIsTestURLTried] = useState<boolean>(false);

  const renderMatchedGroups = useCallback(() => {
    if (
      updatedSource.operator === RuleSourceOperator.MATCHES ||
      updatedSource.operator === RuleSourceOperator.WILDCARD_MATCHES
    ) {
      return (
        <div className="group-match-wrapper">
          {matchedGroups.map(
            (group, index) =>
              index !== 0 && (
                <span key={index}>
                  <span className="text-bold">${index}</span> = <Typography.Text code>{group || '""'}</Typography.Text>
                </span>
              )
          )}
        </div>
      );
    }
  }, [matchedGroups, updatedSource.operator]);

  const renderResult = useCallback(() => {
    if (updatedSource.operator === RuleSourceOperator.MATCHES && !isValidRegex(updatedSource.value)) {
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

  const handleTestURL = useCallback(() => {
    try {
      const result = RULE_PROCESSOR.RuleMatcher.matchUrlWithRuleSourceWithExtraInfo(updatedSource, testURL, testURL);
      if (result?.destination?.length) {
        setIsCheckPassed(true);
        if (result?.matches?.length) setMatchedGroups(result.matches);
      } else {
        setMatchedGroups([]);
        setIsCheckPassed(false);
      }
    } catch {
      setMatchedGroups([]);
      setIsCheckPassed(false);
    }
  }, [updatedSource, testURL]);

  const debouncedHandleTestURL = useDebounce(handleTestURL);

  const handleSourceConfigChange = (updatedSource: Source) => {
    if (!isSourceModified) {
      trackURLConditionSourceModified(updatedSource.operator, analyticsContext);
      setIsSourceModified(true);
    }
    setUpdatedSource(updatedSource);
    debouncedHandleTestURL();
  };

  const handleTestURLChange = (value: string) => {
    if (!isTestURLTried) {
      trackURLConditionMatchingTried(updatedSource.operator, analyticsContext);
      setIsTestURLTried(true);
    }
    setTestURL(value);
    debouncedHandleTestURL();
  };

  useEffect(() => {
    if (isOpen) {
      handleTestURL();
    }
  }, [isOpen, handleTestURL]);

  useEffect(() => {
    trackURLConditionModalViewed(source.operator, analyticsContext);
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
        <Typography.Title level={4}>
          Test and apply {updatedSource.operator === RuleSourceOperator.MATCHES ? "Regex" : "Wildcard"} condition
        </Typography.Title>
        <Typography.Text className="text-gray">
          Check if your request URL matches the rule condition you specified.{" "}
          <a href={LINKS.REQUESTLY_DOCS_TEST_URL_CONDITION} target="_blank" rel="noreferrer">
            Learn more
          </a>
        </Typography.Text>
      </div>
      <Divider />
      <div className="test-url-modal-body">
        <div className="text-bold white">Source condition</div>
        <div className="mt-8">
          <SourceConditionInput
            source={updatedSource}
            onSourceChange={(updatedSource) => handleSourceConfigChange(updatedSource)}
          />
        </div>
        <div className="test-url-modal-section">
          <div className="text-bold white"> Enter URL to be checked</div>
          <Input
            className="test-url-field"
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
            {matchedGroups.length && testURL.length ? renderMatchedGroups() : null}
          </div>
        </div>
      </div>
      <div className="rq-modal-footer test-url-modal-footer">
        <Row className="w-full" justify="space-between">
          <Row />
          {isEqual(originalSource, updatedSource) ? (
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
                trackURLConditionSourceModificationSaved(updatedSource.operator, analyticsContext);
              }}
            >
              Use condition
            </RQButton>
          )}
        </Row>
      </div>
    </RQModal>
  );
};
