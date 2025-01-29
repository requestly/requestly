import React, { useRef, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Radio, Tooltip } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { formatJSONString } from "utils/CodeEditorUtils";
import { globalActions } from "store/slices/global/slice";
import CodeEditor, { EditorLanguage } from "componentsV2/CodeEditor";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { RuleType } from "@requestly/shared/types/entities/rules";

const RequestBodyRow = ({ rowIndex, pair, pairIndex, ruleDetails, isInputDisabled }) => {
  const dispatch = useDispatch();
  const codeFormattedFlag = useRef(null);

  const [requestBodies, setRequestBodies] = useState({
    static: "{}",
    code: ruleDetails["REQUEST_BODY_JAVASCRIPT_DEFAULT_VALUE"],
    local_file: "",
  });

  const onChangeRequestType = useCallback(
    (requestType) => {
      setRequestBodies((prev) => ({
        ...prev,
        [pair.request.type]: pair.request.value,
      }));

      const value = requestBodies[requestType];
      dispatch(
        globalActions.updateRulePairAtGivenPath({
          pairIndex,
          triggerUnsavedChangesIndication: false,
          updates: {
            "request.type": requestType,
            "request.value": value,
          },
        })
      );
    },
    [dispatch, pair.request.type, pair.request.value, pairIndex, requestBodies]
  );

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
    dispatch(
      globalActions.updateRulePairAtGivenPath({
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
            <Col xl="12" span={24}>
              <CodeEditor
                // key={pair.request.type}
                language={
                  pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE
                    ? EditorLanguage.JAVASCRIPT
                    : EditorLanguage.JSON
                }
                defaultValue={getEditorDefaultValue()}
                value={pair.request.value}
                handleChange={requestBodyChangeHandler}
                prettifyOnInit={true}
                isReadOnly={isInputDisabled}
                analyticEventProperties={{ source: "rule_editor", rule_type: RuleType.REQUEST }}
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
