import React, { useRef, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { Row, Col, Radio } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { Popconfirm } from "antd";
import { formatJSONString } from "utils/CodeEditorUtils";
import { actions } from "store";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { PremiumIcon } from "components/common/PremiumIcon";
import { PremiumFeature } from "features/pricing";
import CodeEditor, { EditorLanguage } from "componentsV2/CodeEditor";

const RequestBodyRow = ({ rowIndex, pair, pairIndex, ruleDetails, isInputDisabled }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [requestTypePopupVisible, setRequestTypePopupVisible] = useState(false);
  const [requestTypePopupSelection, setRequestTypePopupSelection] = useState(
    pair?.request?.type ?? GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC
  );
  const [editorStaticValue, setEditorStaticValue] = useState(
    pair?.request?.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC && pair.request.value
  );

  const codeFormattedFlag = useRef(null);
  const { getFeatureLimitValue } = useFeatureLimiter();

  const onChangeRequestType = useCallback(
    (requestType) => {
      if (Object.values(GLOBAL_CONSTANTS.REQUEST_BODY_TYPES).includes(requestType)) {
        let value = "{}";
        if (requestType === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE) {
          value = ruleDetails["REQUEST_BODY_JAVASCRIPT_DEFAULT_VALUE"];
        } else if (requestType === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC) {
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
    },
    [dispatch, pairIndex, ruleDetails]
  );

  const showPopup = useCallback((e) => {
    const requestType = e.target.value;

    setRequestTypePopupSelection(requestType);
    setRequestTypePopupVisible(true);
  }, []);

  const getEditorDefaultValue = useCallback(() => {
    codeFormattedFlag.current = true;
    setTimeout(() => {
      codeFormattedFlag.current = false;
    }, 2000);

    if (pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC) {
      return "{}";
    }
    return null;
  }, [pair.request.type]);

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

  const isPremiumFeature = !getFeatureLimitValue(FeatureLimitType.dynamic_request_body);

  const EditorRadioGroupOptions = useMemo(() => {
    return (
      <Popconfirm
        disabled={requestTypePopupSelection !== GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE && !user?.details?.isPremium}
        title="This will clear the existing body content"
        onConfirm={() => {
          onChangeRequestType(requestTypePopupSelection);
          setRequestTypePopupVisible(false);
        }}
        onCancel={() => setRequestTypePopupVisible(false)}
        okText="Confirm"
        cancelText="Cancel"
        open={requestTypePopupVisible && requestTypePopupSelection !== GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE}
      >
        <Radio.Group
          onChange={showPopup}
          value={pair.request.type}
          disabled={isInputDisabled}
          data-tour-id="rule-editor-requestbody-types"
          className="response-body-type-radio-group"
        >
          <Radio value={GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC}>Static</Radio>
          <PremiumFeature
            features={[FeatureLimitType.dynamic_request_body]}
            featureName="Dynamic Request Body"
            popoverPlacement="top"
            onContinue={() => onChangeRequestType(GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE)}
            source="dynamic_request_body"
          >
            <Radio value={GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE}>
              <Row align="middle">
                Programmatic (JavaScript)
                {isPremiumFeature ? <PremiumIcon featureType="dynamic_request_body" /> : null}
              </Row>
            </Radio>
          </PremiumFeature>
        </Radio.Group>
      </Popconfirm>
    );
  }, [
    requestTypePopupSelection,
    requestTypePopupVisible,
    onChangeRequestType,
    setRequestTypePopupVisible,
    showPopup,
    pair.request.type,
    isInputDisabled,
    isPremiumFeature,
    user?.details?.isPremium,
  ]);

  return (
    <Col span={24} data-tour-id="code-editor">
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
                language={
                  pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE
                    ? EditorLanguage.JAVASCRIPT
                    : EditorLanguage.JSON
                }
                defaultValue={getEditorDefaultValue()}
                value={
                  pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC
                    ? editorStaticValue
                    : pair.request.value
                }
                handleChange={requestBodyChangeHandler}
                isReadOnly={isInputDisabled}
                toolbarOptions={{
                  title: "Request Body",
                  options: [EditorRadioGroupOptions],
                }}
                isResizable
              />
            </Col>
          </Row>
        </>
      ) : null}
    </Col>
  );
};

export default RequestBodyRow;
