import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Radio, Typography, Popover, Button } from "antd";
// Constants
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
// Utils
import { getAppMode } from "../../../../../../../../store/selectors";
import { getByteSize } from "../../../../../../../../utils/FormattingHelper";

import { Popconfirm } from "antd";
import CodeEditor from "components/misc/CodeEditor";
import FileDialogButton from "components/mode-specific/desktop/misc/FileDialogButton";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { minifyCode } from "utils/CodeEditorUtils";
import { getAppDetails } from "utils/AppUtils";

const { Text } = Typography;

const ResponseBodyRow = ({
  rowIndex,
  pair,
  pairIndex,
  helperFunctions,
  ruleDetails,
  isInputDisabled,
}) => {
  const { modifyPairAtGivenPath } = helperFunctions;
  const appMode = useSelector(getAppMode);

  const [responseTypePopupVisible, setResponseTypePopupVisible] = useState(
    false
  );
  const [responseTypePopupSelection, setResponseTypePopupSelection] = useState(
    GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC
  );
  const [editorStaticValue, setEditorStaticValue] = useState(
    pair.response.value
  );
  const [isCodeMinified, setIsCodeMinified] = useState(true);
  const [isJSPrettified, setIsJSPrettified] = useState(false);

  const onChangeResponseType = (responseType) => {
    if (
      Object.values(GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES).includes(responseType)
    ) {
      let value = "";
      if (responseType === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE) {
        value = ruleDetails["RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE"];
      } else {
        setIsCodeMinified(true);
        setEditorStaticValue(value);
      }

      modifyPairAtGivenPath(null, pairIndex, `response.type`, responseType, [
        {
          path: `response.value`,
          value: value,
        },
      ]);
    }
  };

  const handleFileSelectCallback = (selectedFile) => {
    modifyPairAtGivenPath(
      null,
      pairIndex,
      `response.type`,
      GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE,
      [
        {
          path: `response.value`,
          value: selectedFile,
        },
      ]
    );
  };

  const showPopup = (e) => {
    const responseType = e.target.value;

    setResponseTypePopupSelection(responseType);
    setResponseTypePopupVisible(true);
  };

  const renderFileSelector = () => {
    if (
      pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE
    ) {
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
              ? minifyCode(value)
              : value,
        },
      ]
    );
  };

  const handleCodePrettifyToggle = () => {
    if (isCodeMinified) {
      setIsCodeMinified(false);
    } else {
      setIsCodeMinified(true);
      setEditorStaticValue(minifyCode(editorStaticValue));
    }
  };

  const handlePrettifyJS = () => {
    setIsJSPrettified(true);
    setTimeout(() => {
      setIsJSPrettified(false);
    }, 2000);
  };

  useEffect(() => {
    if (pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE) {
      setIsCodeMinified(false);
    }
  }, [pair.response.type]);

  return (
    <React.Fragment key={rowIndex}>
      <Row
        key={rowIndex}
        span={24}
        align="middle"
        className="code-editor-header-row"
      >
        <Col span={10}>
          <span>Response Body</span>
        </Col>
        <Col span={14} align="right">
          <Popconfirm
            title="This will clear the existing body content"
            onConfirm={() => {
              onChangeResponseType(responseTypePopupSelection);
              setResponseTypePopupVisible(false);
            }}
            onCancel={() => setResponseTypePopupVisible(false)}
            okText="Confirm"
            cancelText="Cancel"
            visible={responseTypePopupVisible}
          >
            <Radio.Group
              onChange={showPopup}
              value={pair.response.type}
              disabled={isInputDisabled}
            >
              <Radio value={GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC}>
                Static Data
              </Radio>
              <Radio value={GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE}>
                Programmatically (JavaScript)
              </Radio>
              {getAppDetails().app_mode ===
              GLOBAL_CONSTANTS.APP_MODES.DESKTOP ? (
                isFeatureCompatible(FEATURES.RESPONSE_MAP_LOCAL) ? (
                  <Radio
                    value={GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE}
                  >
                    Local File
                  </Radio>
                ) : (
                  <Popover
                    placement="left"
                    content={
                      "Update to latest version of app to enjoy this feature"
                    }
                  >
                    <Radio
                      value={GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE}
                      disabled={true}
                    >
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
      {pair.response.type !==
      GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE ? (
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
                language={
                  pair.response.type ===
                  GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE
                    ? "javascript"
                    : "json"
                }
                value={
                  pair.response.type ===
                  GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC
                    ? editorStaticValue
                    : pair.response.value
                }
                defaultValue={
                  pair.response.type ===
                    GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC &&
                  appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION
                    ? "{}"
                    : null
                }
                handleChange={responseBodyChangeHandler}
                readOnly={isInputDisabled}
                validation={
                  pair.response.type ===
                  GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC
                    ? "off"
                    : "editable"
                }
                unlockCodePrettify={true}
                isCodeMinified={isCodeMinified}
                isJSPrettified={isJSPrettified}
              />
            </Col>
          </Row>
          <Row
            align="middle"
            justify="space-between"
            className="code-editor-character-count-row "
          >
            <Col align="left">
              {pair.response.type ===
              GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC ? (
                <>
                  <Button type="link" onClick={handleCodePrettifyToggle}>
                    {isCodeMinified ? (
                      <span>Pretty Print {"{ }"}</span>
                    ) : (
                      <span>View Raw</span>
                    )}
                  </Button>
                </>
              ) : (
                <Button type="link" onClick={handlePrettifyJS}>
                  Pretty Print {"{ }"}
                </Button>
              )}
            </Col>
            <Col span={6} align="right">
              <span className="codemirror-character-count text-gray">
                {getByteSize(pair.response.value)} characters left
              </span>
            </Col>
          </Row>
        </>
      ) : null}
    </React.Fragment>
  );
};

export default ResponseBodyRow;
