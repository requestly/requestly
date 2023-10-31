import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Radio, Button } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { getByteSize } from "../../../../../../../../utils/FormattingHelper";
import { Popconfirm } from "antd";
import CodeEditor from "components/misc/CodeEditor";
import { minifyCode, formatJSONString } from "utils/CodeEditorUtils";
import { actions } from "store";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { PremiumIcon } from "components/common/PremiumIcon";

const RequestBodyRow = ({ rowIndex, pair, pairIndex, ruleDetails, isInputDisabled }) => {
  const dispatch = useDispatch();
  const [requestTypePopupVisible, setRequestTypePopupVisible] = useState(false);
  const [requestTypePopupSelection, setRequestTypePopupSelection] = useState(
    pair?.request?.type ?? GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC
  );
  const [isCodeFormatted, setIsCodeFormatted] = useState(false);
  const [isCodeMinified, setIsCodeMinified] = useState(true);
  const [editorStaticValue, setEditorStaticValue] = useState(
    pair?.request?.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC && pair.request.value
  );

  const codeFormattedFlag = useRef(null);
  const { getFeatureLimitValue } = useFeatureLimiter();

  const onChangeRequestType = (requestType) => {
    if (Object.values(GLOBAL_CONSTANTS.REQUEST_BODY_TYPES).includes(requestType)) {
      let value = "{}";
      if (requestType === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE) {
        value = ruleDetails["REQUEST_BODY_JAVASCRIPT_DEFAULT_VALUE"];
      } else if (requestType === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC) {
        setIsCodeMinified(true);
        setEditorStaticValue(value);
      }

      dispatch(
        actions.updateRulePairAtGivenPath({
          pairIndex,
          updates: {
            "request.type": requestType,
            "request.value": value,
          },
        })
      );
    }
  };

  const showPopup = (e) => {
    const requestType = e.target.value;

    setRequestTypePopupSelection(requestType);
    setRequestTypePopupVisible(true);
  };

  const getEditorDefaultValue = useCallback(() => {
    codeFormattedFlag.current = true;
    setTimeout(() => {
      codeFormattedFlag.current = false;
    }, 2000);

    if (pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC) {
      return pair.request.value ? pair.request.value : "";
    }
    return null;
  }, [pair.request.type, pair.request.value]);

  const requestBodyChangeHandler = (value) => {
    if (pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC) {
      setEditorStaticValue(value);
    }

    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        triggerUnsavedChangesIndication: !codeFormattedFlag.current,
        updates: {
          "request.type": pair.request.type,
          "request.value":
            pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC ? formatJSONString(value) : value,
        },
      })
    );
  };

  const handleCodeFormattedFlag = () => {
    setIsCodeFormatted(true);
    codeFormattedFlag.current = true;
    setTimeout(() => {
      setIsCodeFormatted(false);
      codeFormattedFlag.current = false;
    }, 2000);
  };

  const handleCodePrettifyToggle = () => {
    if (!isCodeMinified) {
      setEditorStaticValue(minifyCode(editorStaticValue));
    }
    setIsCodeMinified((isMinified) => !isMinified);
    handleCodeFormattedFlag();
  };

  useEffect(() => {
    if (pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE) {
      setIsCodeMinified(false);
    }
  }, [pair.request.type]);

  const isPremiumFeature = !getFeatureLimitValue(FeatureLimitType.dynamic_request_body);

  return (
    <Col span={24} data-tour-id="code-editor">
      <div className="subtitle response-body-row-header">Request Body</div>
      <Row key={rowIndex} align="middle" className="code-editor-header-row">
        <Col span={24}>
          <Popconfirm
            title="This will clear the existing body content"
            onConfirm={() => {
              onChangeRequestType(requestTypePopupSelection);
              setRequestTypePopupVisible(false);
            }}
            onCancel={() => setRequestTypePopupVisible(false)}
            okText="Confirm"
            cancelText="Cancel"
            open={requestTypePopupVisible}
          >
            <Radio.Group
              onChange={showPopup}
              value={pair.request.type}
              disabled={isInputDisabled}
              data-tour-id="rule-editor-requestbody-types"
              className="response-body-type-radio-group"
            >
              <Radio value={GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC}>Static</Radio>
              <Radio value={GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE}>
                <Row align="middle">
                  Programmatic (JavaScript)
                  {isPremiumFeature ? <PremiumIcon featureType="dynamic_request_body" /> : null}
                </Row>
              </Radio>
            </Radio.Group>
          </Popconfirm>
        </Col>
      </Row>

      {pair.request.type !== GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.LOCAL_FILE ? (
        <>
          <Row
            span={24}
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Col xl="12" span={24}>
              <CodeEditor
                key={pair.request.type}
                language={pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE ? "javascript" : "json"}
                value={
                  pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC
                    ? editorStaticValue
                    : pair.request.value
                }
                defaultValue={getEditorDefaultValue()}
                handleChange={requestBodyChangeHandler}
                readOnly={isInputDisabled}
                validation={pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC ? "off" : "editable"}
                unlockJsonPrettify={true}
                isCodeMinified={isCodeMinified}
                isCodeFormatted={isCodeFormatted}
              />
            </Col>
          </Row>
          <Row align="middle" justify="space-between" className="code-editor-character-count-row ">
            <Col align="left">
              {pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE ? (
                <Button type="link" onClick={handleCodeFormattedFlag}>
                  Pretty Print {"{ }"}
                </Button>
              ) : (
                <>
                  <Button type="link" onClick={handleCodePrettifyToggle}>
                    {isCodeMinified ? <span>Pretty Print {"{ }"}</span> : <span>View Raw</span>}
                  </Button>
                </>
              )}
            </Col>
            <Col span={6} align="right" className="text-gray code-editor-character-count-row">
              <span>{getByteSize(pair.request.value)} characters</span>
            </Col>
          </Row>
        </>
      ) : null}
    </Col>
  );
};

export default RequestBodyRow;
