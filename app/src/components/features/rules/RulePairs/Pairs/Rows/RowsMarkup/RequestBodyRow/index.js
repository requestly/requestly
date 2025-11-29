import React, { useRef, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Radio, Tooltip } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { globalActions } from "store/slices/global/slice";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { RuleType } from "@requestly/shared/types/entities/rules";
import Editor from "componentsV2/CodeEditor";
import { useEditorHeight } from "hooks/useEditorHeight";

const RequestBodyRow = ({ rowIndex, pair, pairIndex, ruleDetails, isInputDisabled }) => {
  const dispatch = useDispatch();
  const { editorHeight, editorContainerRef, setEditorHeight } = useEditorHeight(300, 150);

  /*
  useRef is not the idle way to handle this, useState should be used to control the behaviour of updating the value in
  state - this needs to be fixed
  */

  const requestBodyValues = useRef({
    static: pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC ? pair.request.value : "{}",
    code:
      pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE
        ? pair.request.value
        : ruleDetails["REQUEST_BODY_JAVASCRIPT_DEFAULT_VALUE"],
  });

  const onChangeRequestType = useCallback(
    (requestType) => {
      dispatch(
        globalActions.updateRulePairAtGivenPath({
          pairIndex,
          triggerUnsavedChangesIndication: false,
          updates: {
            "request.type": requestType,
            "request.value": requestBodyValues.current[requestType],
          },
        })
      );
    },
    [dispatch, pairIndex]
  );

  const getEditorDefaultValue = useCallback(() => {
    if (pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC) {
      return "{}";
    }
    return null;
  }, [pair.request.type]);

  const requestBodyChangeHandler = (value, triggerUnsavedChanges) => {
    requestBodyValues.current[pair.request.type] = value;
    dispatch(
      globalActions.updateRulePairAtGivenPath({
        pairIndex,
        triggerUnsavedChangesIndication: triggerUnsavedChanges,
        updates: {
          "request.type": pair.request.type,
          "request.value": requestBodyValues.current[pair.request.type],
        },
      })
    );
  };

  const EditorRadioGroupOptions = useMemo(() => {
    return (
      <Radio.Group
        onChange={(e) => onChangeRequestType(e.target.value)}
        value={pair.request.type}
        disabled={isInputDisabled}
        data-tour-id="rule-editor-requestbody-types"
        className="response-body-type-radio-group"
      >
        <Radio value={GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC}>
          <Row align="middle">
            Static Data{" "}
            <Tooltip
              title={
                <>
                  Enter the static JSON that you want to send in the request body.{" "}
                  {/* <a target="_blank" rel="noreferrer" href={LINKS.REQUESTLY_REQUEST_RULE_DOCS}>
                      Click here
                    </a>{" "}
                    to know more. */}
                </>
              }
              overlayClassName="rq-tooltip"
            >
              <MdInfoOutline className="response-body-type-info-icon" />
            </Tooltip>
          </Row>
        </Radio>
        <Radio value={GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE}>
          <Row align="middle">
            Dynamic (JavaScript)
            <Tooltip
              title={
                <>
                  Write the JavaScript code to modify the existing request body.{" "}
                  {/* <a target="_blank" rel="noreferrer" href={LINKS.REQUESTLY_REQUEST_RULE_DOCS}>
                      Click here
                    </a>{" "}
                    to know more. */}
                </>
              }
              overlayClassName="rq-tooltip"
            >
              <MdInfoOutline className="response-body-type-info-icon" />
            </Tooltip>
          </Row>
        </Radio>
      </Radio.Group>
    );
  }, [pair.request.type, isInputDisabled, onChangeRequestType]);

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
            <Col xl="12" span={24} ref={editorContainerRef}>
              <Editor
                // key={pair.request.type}
                language={
                  pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE
                    ? EditorLanguage.JAVASCRIPT
                    : EditorLanguage.JSON
                }
                value={requestBodyValues.current[pair.request.type] ?? getEditorDefaultValue()}
                handleChange={requestBodyChangeHandler}
                prettifyOnInit={true}
                isReadOnly={isInputDisabled}
                analyticEventProperties={{ source: "rule_editor", rule_type: RuleType.REQUEST }}
                toolbarOptions={{
                  title: "Request Body",
                  options: [EditorRadioGroupOptions],
                }}
                height={editorHeight}
                onHeightChange={setEditorHeight}
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
