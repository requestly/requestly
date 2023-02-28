import React, { useState } from "react";
import { Row, Col, Radio, Button } from "antd";
// Constants
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { getByteSize } from "../../../../../../../../utils/FormattingHelper";

import { Popconfirm } from "antd";
import CodeEditor from "components/misc/CodeEditor";

const RequestBodyRow = ({
  rowIndex,
  pair,
  pairIndex,
  helperFunctions,
  ruleDetails,
  isInputDisabled,
}) => {
  const { modifyPairAtGivenPath } = helperFunctions;

  const [requestTypePopupVisible, setRequestTypePopupVisible] = useState(false);
  const [requestTypePopupSelection, setRequestTypePopupSelection] = useState(
    GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC
  );
  const [isJSPrettified, setIsJSPrettified] = useState(false);

  const onChangeRequestType = (requestType) => {
    if (
      Object.values(GLOBAL_CONSTANTS.REQUEST_BODY_TYPES).includes(requestType)
    ) {
      let value = "";
      if (requestType === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE) {
        value = ruleDetails["REQUEST_BODY_JAVASCRIPT_DEFAULT_VALUE"];
      }

      modifyPairAtGivenPath(null, pairIndex, `request.type`, requestType, [
        {
          path: `request.value`,
          value: value,
        },
      ]);
    }
  };

  const showPopup = (e) => {
    const requestType = e.target.value;

    setRequestTypePopupSelection(requestType);
    setRequestTypePopupVisible(true);
  };

  const requestBodyChangeHandler = (value) => {
    modifyPairAtGivenPath(
      null,
      pairIndex,
      `request.type`,
      pair.request.type,
      [
        {
          path: `request.value`,
          value: value,
        },
      ],
      !isJSPrettified
    );
  };

  const handlePrettifyJS = () => {
    setIsJSPrettified(true);
    setTimeout(() => {
      setIsJSPrettified(false);
    }, 2000);
  };

  return (
    <React.Fragment key={rowIndex}>
      <Row key={rowIndex} align="middle" className="code-editor-header-row">
        <Col span={12}>
          <span>Request Body</span>
        </Col>
        <Col align="right" span={12}>
          <Popconfirm
            title="This will clear the existing body content"
            onConfirm={() => {
              onChangeRequestType(requestTypePopupSelection);
              setRequestTypePopupVisible(false);
            }}
            onCancel={() => setRequestTypePopupVisible(false)}
            okText="Confirm"
            cancelText="Cancel"
            visible={requestTypePopupVisible}
          >
            <Radio.Group
              onChange={showPopup}
              value={pair.request.type}
              disabled={isInputDisabled}
            >
              <Radio value={GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC}>
                Static
              </Radio>
              <Radio value={GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE}>
                Programmatic (JavaScript)
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
                language={
                  pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE
                    ? "javascript"
                    : "json"
                }
                value={pair.request.value}
                handleChange={requestBodyChangeHandler}
                readOnly={isInputDisabled}
                validation={
                  pair.request.type ===
                  GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.STATIC
                    ? "off"
                    : "editable"
                }
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
              {pair.request.type ===
              GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE ? (
                <Button type="link" onClick={handlePrettifyJS}>
                  Pretty Print {"{ }"}
                </Button>
              ) : null}
            </Col>
            <Col
              span={6}
              align="right"
              className="text-gray code-editor-character-count-row"
            >
              <span>{getByteSize(pair.request.value)} characters</span>
            </Col>
          </Row>
        </>
      ) : null}
    </React.Fragment>
  );
};

export default RequestBodyRow;
