import React, { useState, useRef, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useTheme } from "styled-components";
import { Row, Col, Radio, Popover, Space, Checkbox, Tooltip, Input } from "antd";
import { globalActions } from "store/slices/global/slice";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import {
  displayFileSelector,
  handleOpenLocalFileInBrowser,
} from "components/mode-specific/desktop/misc/FileDialogButton";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { formatJSONString } from "utils/CodeEditorUtils";
import { getAppDetails } from "utils/AppUtils";
import InfoIcon from "components/misc/InfoIcon";
import { trackServeResponseWithoutRequestEnabled } from "modules/analytics/events/features/ruleEditor";
import { HiOutlineExternalLink } from "@react-icons/all-files/hi/HiOutlineExternalLink";
import { InfoTag } from "components/misc/InfoTag";
import { RQButton } from "lib/design-system-v2/components";
import LINKS from "config/constants/sub/links";
import CodeEditor, { EditorLanguage } from "componentsV2/CodeEditor";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { RuleType } from "features/rules";
import { MdOutlineEdit } from "@react-icons/all-files/md/MdOutlineEdit";
import "./ResponseBodyRow.css";

const ResponseBodyRow = ({ rowIndex, pair, pairIndex, ruleDetails, isInputDisabled }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isSelectedFileInputVisible, setIsSelectedFileInputVisible] = useState(false);

  const isServeWithoutRequestSupported = useMemo(
    () => isFeatureCompatible(FEATURES.SERVE_RESPONSE_WITHOUT_REQUEST),
    []
  );

  const [responseBodies, setResponseBodies] = useState({
    static: "{}",
    code: ruleDetails["RESPONSE_BODY_JAVASCRIPT_DEFAULT_VALUE"],
    local_file: "",
  });

  const codeFormattedFlag = useRef(null);

  const onChangeResponseType = useCallback(
    (responseBodyType) => {
      setResponseBodies((prev) => ({
        ...prev,
        [pair.response.type]: pair.response.value,
      }));

      const value = responseBodies[responseBodyType];
      dispatch(
        globalActions.updateRulePairAtGivenPath({
          pairIndex,
          triggerUnsavedChangesIndication: false,
          updates: {
            "response.type": responseBodyType,
            "response.value": value,
            "response.serveWithoutRequest": undefined,
          },
        })
      );
    },
    [dispatch, pair.response.type, pair.response.value, pairIndex, responseBodies]
  );

  const handleFileSelectCallback = (selectedFile) => {
    dispatch(
      globalActions.updateRulePairAtGivenPath({
        pairIndex,
        updates: {
          "response.type": GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE,
          "response.value": selectedFile,
          // Removing this as we are not stripping file:// in requestly-proxy. Add this once we do that.
          // value: `file://${selectedFile}`,
        },
      })
    );
  };

  const renderFileSelector = () => {
    if (pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE) {
      return (
        <Row span={24}>
          <Col span={24} className="picker-container local-file-selector-row">
            <Space>
              <RQButton
                // onPointerEnter={() => trackDesktopActionInterestCaptured("map_local")}
                disabled={!isFeatureCompatible(FEATURES.RESPONSE_MAP_LOCAL) || isInputDisabled}
                type="default"
                onClick={() => {
                  displayFileSelector(handleFileSelectCallback);
                  // trackClickMapLocalFile();
                }}
              >
                {pair.response.value ? "Change file" : " Select file"}
              </RQButton>
              {pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES ||
              pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.WILDCARD_MATCHES ? (
                <>
                  {isSelectedFileInputVisible ? (
                    <Input
                      autoFocus
                      onBlur={() => setIsSelectedFileInputVisible(false)}
                      style={{
                        width: 350,
                      }}
                      value={pair.response.value}
                      onChange={(e) => {
                        dispatch(
                          globalActions.updateRulePairAtGivenPath({
                            pairIndex,
                            updates: { "response.value": e.target.value },
                          })
                        );
                      }}
                    />
                  ) : (
                    <>
                      <span className="file-path">{pair.response.value ? pair.response.value : " No file chosen"}</span>
                      {pair.response.value ? (
                        <>
                          {isFeatureCompatible(FEATURES.EDIT_LOCAL_FILE_PATH) ? (
                            <Tooltip
                              color={theme?.colors?.black}
                              placement="top"
                              title={
                                <>
                                  You can use the captured group expressions from the request to dynamically set the
                                  file path (using $1, $2, etc).
                                  <br />
                                  <a
                                    href="https://docs.requestly.com/general/http-rules/advanced-usage/rule-operators#regex-match-operator"
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    click here
                                  </a>{" "}
                                  to learn more.
                                </>
                              }
                            >
                              <RQButton
                                size="small"
                                type="link"
                                onClick={() => {
                                  setIsSelectedFileInputVisible(true);
                                }}
                                icon={<MdOutlineEdit />}
                              />
                            </Tooltip>
                          ) : null}
                        </>
                      ) : null}
                    </>
                  )}
                </>
              ) : (
                <span className="file-path"> {pair.response.value ? pair.response.value : " No file chosen"}</span>
              )}
            </Space>
            {pair.response.value && isFeatureCompatible(FEATURES.RESPONSE_MAP_LOCAL) && (
              <HiOutlineExternalLink
                className="external-link-icon"
                onClick={() => handleOpenLocalFileInBrowser(pair.response.value)}
              />
            )}
            <span>
              {!isFeatureCompatible(FEATURES.RESPONSE_MAP_LOCAL) && (
                <InfoTag
                  title="DESKTOP ONLY RULE"
                  tooltipWidth="400px"
                  description={
                    <>
                      This rule cannot be executed using Extension because the request accesses a local file that cannot
                      be accessed by the browser.{" "}
                      <a className="tooltip-link" href={LINKS.REQUESTLY_DOWNLOAD_PAGE} target="_blank" rel="noreferrer">
                        Use this on Desktop App!
                      </a>
                    </>
                  }
                />
              )}
            </span>
          </Col>
        </Row>
      );
    }

    return null;
  };

  const responseBodyChangeHandler = (value) => {
    dispatch(
      globalActions.updateRulePairAtGivenPath({
        pairIndex,
        updates: {
          "response.type": pair.response.type,
          "response.value":
            pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC ? formatJSONString(value) : value,
        },
        triggerUnsavedChangesIndication: !codeFormattedFlag.current,
      })
    );
  };

  const handleServeWithoutRequestFlagChange = (event) => {
    if (pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC) {
      const flag = event.target.checked;

      if (flag) {
        trackServeResponseWithoutRequestEnabled();
      }

      dispatch(
        globalActions.updateRulePairAtGivenPath({
          pairIndex,
          updates: {
            "response.serveWithoutRequest": flag,
          },
        })
      );
    }
  };

  const getEditorDefaultValue = useCallback(() => {
    // handle unsaved changes trigger
    codeFormattedFlag.current = true;
    setTimeout(() => {
      codeFormattedFlag.current = false;
    }, 2000);

    if (pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC) {
      return "{}";
    }
    return null;
  }, [pair.response.type]);

  const EditorRadioGroupOptions = useMemo(() => {
    return (
      <Radio.Group
        onChange={(e) => onChangeResponseType(e.target.value)}
        value={pair.response.type}
        disabled={isInputDisabled}
        className="response-body-type-radio-group"
        data-tour-id="rule-editor-responsebody-types"
        size="small"
      >
        <Radio value={GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC}>
          <Row align="middle">
            Static Data{" "}
            <Tooltip
              title={
                <>
                  Enter the response body that you want as a response to the request.{" "}
                  {/* <a href={LINKS.REQUESTLY_RESPONSE_RULE_DOCS} target="_blank" rel="noreferrer">
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
        <Radio value={GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE}>
          <Row align="middle">
            Dynamic (JavaScript){" "}
            <Tooltip
              title={
                <>
                  Write JavaScript code to modify the existing response body.{" "}
                  {/* <a href={LINKS.REQUESTLY_RESPONSE_RULE_DOCS} target="_blank" rel="noreferrer">
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
    );
  }, [pair.response.type, isInputDisabled, onChangeResponseType]);

  return (
    <Col span={24} data-tour-id="code-editor" key={rowIndex}>
      {/* <div className="subtitle response-body-row-header">Response Body</div> */}
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
                // key={pair.response.type}
                language={
                  pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE
                    ? EditorLanguage.JAVASCRIPT
                    : EditorLanguage.JSON
                }
                defaultValue={getEditorDefaultValue()}
                value={pair.response.value}
                isReadOnly={isInputDisabled}
                prettifyOnInit={true}
                handleChange={responseBodyChangeHandler}
                isResizable
                analyticEventProperties={{ source: "rule_editor", rule_type: RuleType.RESPONSE }}
                toolbarOptions={{
                  title: "Response Body",
                  options: [EditorRadioGroupOptions],
                }}
              />
            </Col>
          </Row>
          {isServeWithoutRequestSupported && pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.STATIC ? (
            <Row className="serve-without-request-setting">
              <Col xl="12" span={24}>
                <Checkbox onChange={handleServeWithoutRequestFlagChange} checked={pair.response.serveWithoutRequest}>
                  Serve this response body without making a call to the server.
                </Checkbox>
                <InfoIcon
                  tooltipPlacement="right"
                  text="When enabled, response is served directly from Requestly and hence Developer Tools won't show this request in network table."
                />
              </Col>
            </Row>
          ) : null}
        </>
      ) : null}
    </Col>
  );
};

export default ResponseBodyRow;
