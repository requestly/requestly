import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row, Col, Radio, Typography, Popover, Button, Popconfirm } from "antd";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { getByteSize } from "../../../../../../../../utils/FormattingHelper";
import CodeEditor from "components/misc/CodeEditor";
import FileDialogButton from "components/mode-specific/desktop/misc/FileDialogButton";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { minifyCode, processStaticDataBeforeSave } from "utils/CodeEditorUtils";
import { getAppDetails } from "utils/AppUtils";
import "./ResponseBodyRow.css";
import { getModeData } from "components/features/rules/RuleBuilder/actions";
import APP_CONSTANTS from "config/constants";

const { Text } = Typography;

const ResponseBodyRow = ({ rowIndex, pair, pairIndex, helperFunctions, ruleDetails, isInputDisabled }) => {
  const { modifyPairAtGivenPath } = helperFunctions;
  const { MODE } = getModeData(window.location);

  const [responseTypePopupVisible, setResponseTypePopupVisible] = useState(false);
  const [responseTypePopupSelection, setResponseTypePopupSelection] = useState(
    pair?.response?.type ?? GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC
  );
  const [editorStaticValue, setEditorStaticValue] = useState(
    pair?.response?.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC && pair.response.value
  );
  const [isCodeMinified, setIsCodeMinified] = useState(true);
  const [isCodeFormatted, setIsCodeFormatted] = useState(false);

  const codeFormattedFlag = useRef(null);

  const onChangeResponseType = (responseBodyType) => {
    if (Object.values(GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES).includes(responseBodyType)) {
      let value = "{}";
      if (responseBodyType === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE) {
        value = ruleDetails["RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE"];
      } else {
        setIsCodeMinified(true);
        setEditorStaticValue(value);
      }

      modifyPairAtGivenPath(null, pairIndex, `response.type`, responseBodyType, [
        {
          path: `response.value`,
          value: value,
        },
      ]);
    }
  };

  const handleFileSelectCallback = (selectedFile) => {
    modifyPairAtGivenPath(null, pairIndex, `response.type`, GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE, [
      {
        path: `response.value`,
        value: selectedFile,
      },
    ]);
  };

  const showPopup = (e) => {
    const responseType = e.target.value;

    setResponseTypePopupSelection(responseType);
    setResponseTypePopupVisible(true);
  };

  const renderFileSelector = () => {
    if (pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE) {
      return (
        <Row span={24} className="margin-top-one">
          <Col span={24} align="right">
            <Text keyboard style={{ paddingRight: 8 }}>
              {pair.response.value || "No File Selected"}
            </Text>
            <FileDialogButton callback={handleFileSelectCallback} />
          </Col>
        </Row>
      );
    }

    return null;
  };

  const responseBodyChangeHandler = (value) => {
    let triggerUnsavedChangesIndication = !codeFormattedFlag.current;
    if (pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC) {
      setEditorStaticValue(value);
    }
    modifyPairAtGivenPath(
      null,
      pairIndex,
      `response.type`,
      pair.response.type,
      [
        {
          path: `response.value`,
          value:
            pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC
              ? processStaticDataBeforeSave(value)
              : value,
        },
      ],
      triggerUnsavedChangesIndication
    );
  };

  const handleCodePrettifyToggle = () => {
    if (!isCodeMinified) {
      setEditorStaticValue(minifyCode(editorStaticValue));
    }
    setIsCodeMinified((isMinified) => !isMinified);
    handleCodeFormattedFlag();
  };

  const handleCodeFormattedFlag = () => {
    setIsCodeFormatted(true);
    codeFormattedFlag.current = true;
    setTimeout(() => {
      setIsCodeFormatted(false);
      codeFormattedFlag.current = false;
    }, 2000);
  };

  const getEditorDefaultValue = useCallback(() => {
    // handle unsaved changes trigger
    codeFormattedFlag.current = true;
    setTimeout(() => {
      codeFormattedFlag.current = false;
    }, 2000);

    if (pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC) {
      if (MODE === APP_CONSTANTS.RULE_EDITOR_CONFIG.MODES.CREATE) {
        return "{}";
      }
      return pair.response.value ?? "{}";
    }
    return null;
  }, [MODE, pair.response.type, pair.response.value]);

  useEffect(() => {
    if (pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE) {
      setIsCodeMinified(false);
    }
  }, [pair.response.type]);

  return (
    <React.Fragment key={rowIndex}>
      <div className="subtitle response-body-row-header">Response Body</div>
      <Row key={rowIndex} span={24} align="middle" className="code-editor-header-row">
        <Col span={24}>
          <Popconfirm
            title="This will clear the existing body content"
            onConfirm={() => {
              onChangeResponseType(responseTypePopupSelection);
              setResponseTypePopupVisible(false);
            }}
            onCancel={() => setResponseTypePopupVisible(false)}
            okText="Confirm"
            cancelText="Cancel"
            open={responseTypePopupVisible}
          >
            <Radio.Group
              onChange={showPopup}
              value={pair.response.type}
              disabled={isInputDisabled}
              className="response-body-type-radio-group"
            >
              <Radio value={GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC}>Static Data</Radio>
              <Radio value={GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE}>Dynamic (JavaScript)</Radio>
              {getAppDetails().app_mode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
                isFeatureCompatible(FEATURES.RESPONSE_MAP_LOCAL) ? (
                  <Radio value={GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE}>Local File</Radio>
                ) : (
                  <Popover placement="left" content={"Update to latest version of app to enjoy this feature"}>
                    <Radio value={GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE} disabled={true}>
                      Local File
                    </Radio>
                  </Popover>
                )
              ) : null}
            </Radio.Group>
          </Popconfirm>
        </Col>
      </Row>
      {renderFileSelector()}
      {pair.response.type !== GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE ? (
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
                key={pair.response.type}
                language={pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE ? "javascript" : "json"}
                value={
                  pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC
                    ? editorStaticValue
                    : pair.response.value
                }
                defaultValue={getEditorDefaultValue()}
                handleChange={responseBodyChangeHandler}
                readOnly={isInputDisabled}
                validation={pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC ? "off" : "editable"}
                unlockJsonPrettify={true}
                isCodeMinified={isCodeMinified}
                isCodeFormatted={isCodeFormatted}
              />
            </Col>
          </Row>
          <Row align="middle" justify="space-between" className="code-editor-character-count-row ">
            <Col align="left">
              {pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC ? (
                <>
                  <Button type="link" onClick={handleCodePrettifyToggle}>
                    {isCodeMinified ? <span>Pretty Print {"{ }"}</span> : <span>View Raw</span>}
                  </Button>
                </>
              ) : (
                <Button type="link" onClick={handleCodeFormattedFlag}>
                  Pretty Print {"{ }"}
                </Button>
              )}
            </Col>
            <Col span={6} align="right">
              <span className="codemirror-character-count text-gray">
                {getByteSize(pair.response.value)} characters
              </span>
            </Col>
          </Row>
        </>
      ) : null}
    </React.Fragment>
  );
};

export default ResponseBodyRow;
