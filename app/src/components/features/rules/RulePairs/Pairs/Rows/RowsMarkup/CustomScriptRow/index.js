import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Input, Tooltip, Typography, Menu, Dropdown, Popconfirm, Button } from "antd";
import { actions } from "store";
//Icons
import { DeleteOutlined, DownOutlined, FolderOpenOutlined } from "@ant-design/icons";
//Constants
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import CodeEditor from "components/misc/CodeEditor";
import "./CustomScriptRow.css";
import MockPickerModal from "components/features/mocksV2/MockPickerModal";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { extractDomNodeDetailsFromHTMLCodeString } from "components/features/rules/RuleBuilder/Header/ActionButtons/CreateRuleButton/actions/insertScriptValidators";

const { Text } = Typography;

function getDefaultScript(language, scriptType, isCompatibleWithHMLAttributes) {
  if (scriptType === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL && isCompatibleWithHMLAttributes) {
    if (language === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS) {
      // eslint-disable-next-line no-template-curly-in-string
      return '<script src=`${{url}}` type="text/javscript"></script>';
    }
    if (language === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS) {
      // eslint-disable-next-line no-template-curly-in-string
      return '<link rel="stylesheet" type="text/css" href="${{url}}">';
    }
  }
  if (scriptType === GLOBAL_CONSTANTS.SCRIPT_TYPES.CODE) {
    if (isCompatibleWithHMLAttributes) {
      if (language === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS) {
        return '<script type="text/javascript">\n\tconsole.log("Hello World");\n</script>';
      }
      if (language === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS) {
        return "<style>\n\tbody {\n\t\t background-color: #fff;\n\t}\n</style>";
      }
    } else {
      if (language === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS) {
        return 'console.log("Hello World");';
      }
      if (language === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS) {
        return "body {\n\t background-color: #fff;\n }";
      }
    }
  }

  return "";
}

function parseScriptCodeValue(codeInput, scripObj) {
  let htmlNode = "";
  if (scripObj.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS) {
    // else CSS
    htmlNode = "script";
  } else if (scripObj.type === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL) {
    htmlNode = "link";
  } else {
    htmlNode = "style";
  }

  // todo: rename and restructure
  const details = extractDomNodeDetailsFromHTMLCodeString(codeInput, htmlNode);

  console.log("details", JSON.stringify(details, null, 2));

  if (!details?.length) {
    return {
      code: codeInput,
      attributes: [],
    };
  }
  if (details.length === 1) {
    return {
      code: details[0].innerText,
      attributes: details[0].attributes,
    };
  } else if (details.length > 1) {
    return {
      code: details[0].innerText,
      attributes: details[0].attributes,
      err: "Multiple HTML Nodes inside the same pair may lead to errors",
    };
  }

  // fail safe
  return {
    code: undefined,
    attributes: undefined,
    err: "Unexpected Error while parsing code",
  };
}

const CustomScriptRow = ({
  rowIndex,
  pairIndex,
  isLastIndex,
  deleteScript,
  script,
  scriptIndex,
  isInputDisabled,
  pair,
}) => {
  const dispatch = useDispatch();

  const [isCodeTypePopupVisible, setIsCodeTypePopupVisible] = useState(false);
  const [codeTypeSelection, setCodeTypeSelection] = useState(GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS);
  const [isScriptDeletePopupVisible, setIsScriptDeletePopupVisible] = useState(false);
  const [isCodeFormatted, setIsCodeFormatted] = useState(false);

  const isAppCompatibleToAttributesForScriptRule = isFeatureCompatible(FEATURES.SCRIPT_RULE_HTML_BLOCK);
  const scriptEditorBoilerCode = useMemo(() => {
    return getDefaultScript(script.codeType, script.type, isAppCompatibleToAttributesForScriptRule);
  }, [script.codeType, script.type, isAppCompatibleToAttributesForScriptRule]);

  const [isMockPickerVisible, setIsMockPickerVisible] = useState(false);

  const getPresentableEditorValue = useMemo(() => {
    console.log("script", JSON.stringify(script, null, 2));
    if (!isAppCompatibleToAttributesForScriptRule) return script.value;
    if (script.attributes?.length > 0) {
      const attributes = script.attributes ?? [];
      const attributesString = attributes
        .map(({ name: attrName, value: attrVal }) => {
          if (!attrVal) return `${attrName}`;
          return `${attrName}="${attrVal}"`;
        })
        .join(" ");

      console.log("attributes", JSON.stringify(attributes, null, 2));
      console.log("attributesString", attributesString);

      if (script.type === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL) {
        if (script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS) {
          // eslint-disable-next-line no-template-curly-in-string
          return `<script ${attributesString ? ` ${attributesString}` : `src="${script.value}"`}></script>`;
        }
        if (script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS) {
          // eslint-disable-next-line no-template-curly-in-string
          return `<link ${attributesString ? ` ${attributesString}` : `href="${script.value}"`}>`;
        }
      }
      if (script.type === GLOBAL_CONSTANTS.SCRIPT_TYPES.CODE) {
        if (script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS) {
          return `<script${attributesString ? ` ${attributesString}` : ""}>${script.value}</script>`;
        }
        if (script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS) {
          return `<style${attributesString ? ` ${attributesString}` : ""}>${script.value}</style>`;
        }
      }
    } else {
      // APP IS COMPATIBLE WITH ATTRIBUTES BUT NO ATTRIBUTES ARE PRESENT IN CURRENT RULE
      return script.value;
    }
  }, [script, isAppCompatibleToAttributesForScriptRule]);

  const handleMockPickerVisibilityChange = (visible) => {
    setIsMockPickerVisible(visible);
  };

  const handleMockPickerSelectionCallback = (url) => {
    setIsMockPickerVisible(false);
    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: {
          [`scripts[${scriptIndex}].value`]: url,
        },
      })
    );
  };

  const renderURLInput = () => {
    const renderCodeEditorForURLInput = () => {
      // todo: rename
      const handleScriptChange = (value) => {
        const { code, attributes } = parseScriptCodeValue(value, script);
        if (code) {
          dispatch(
            actions.triggerToastForEditor({
              id: pair.id,
              message: "Code isn't expected when src is remote url",
              type: "info",
            })
          );
        }
        console.log("attributes in url code editor", attributes);
        dispatch(
          actions.updateRulePairAtGivenPath({
            pairIndex,
            updates: {
              [`scripts[${scriptIndex}].attributes`]: attributes,
            },
          })
        );
      };

      const handleCodeFormattedFlag = () => {
        setIsCodeFormatted(true);
        setTimeout(() => {
          setIsCodeFormatted(false);
        }, 2000);
      };
      return (
        <Col span={24} data-tour-id="code-editor">
          <Row
            key={rowIndex}
            span={24}
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Col xl="12" span={24}>
              <CodeEditor
                id={pair.id}
                height={75}
                language={script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS ? "javascript" : "css"}
                defaultValue={scriptEditorBoilerCode}
                value={getPresentableEditorValue}
                handleChange={handleScriptChange}
                readOnly={isInputDisabled}
                isCodeFormatted={isCodeFormatted}
              />
            </Col>
          </Row>
          <Row span={24} align="middle" justify="space-between" className="code-editor-character-count-row ">
            <Col align="left">
              {script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS ? (
                <Button type="link" onClick={handleCodeFormattedFlag}>
                  Pretty Print {"{ }"}
                </Button>
              ) : null}
            </Col>
            <Col span={6} align="right">
              <span className="codemirror-character-count text-gray">{script.value?.length ?? 0} characters</span>
            </Col>
          </Row>
        </Col>
      );
    };

    return (
      <Col span={24}>
        <Row className="margin-top-one" span={24} gutter={16} align="middle">
          <Col span={2}>
            <span>Source</span>
          </Col>
          <Col span={22}>
            <Input
              style={{ cursor: "pointer" }}
              addonAfter={
                isInputDisabled ? null : (
                  <Tooltip title="Import a existing Mock API" onClick={() => setIsMockPickerVisible(true)}>
                    <FolderOpenOutlined />
                    &nbsp; Pick from Mock Server
                  </Tooltip>
                )
              }
              className="display-inline-block has-dark-text"
              placeholder="Enter Source URL (relative or absolute)"
              type="text"
              disabled={isInputDisabled}
              onChange={(event) =>
                dispatch(
                  actions.updateRulePairAtGivenPath({
                    pairIndex,
                    updates: {
                      [`scripts[${scriptIndex}].value`]: event?.target?.value,
                    },
                  })
                )
              }
              value={script.value}
            />
          </Col>
          {/* MODALS */}
          {/* TODO: Remove this once MockV2 Released */}
          {isMockPickerVisible ? (
            <Col span={2}>
              <MockPickerModal
                isVisible={isMockPickerVisible}
                onVisibilityChange={handleMockPickerVisibilityChange}
                mockSelectionCallback={handleMockPickerSelectionCallback}
              />
            </Col>
          ) : null}
        </Row>
        {isAppCompatibleToAttributesForScriptRule ? (
          <Row className="margin-top-one" span={24} gutter={16} align="middle">
            {renderCodeEditorForURLInput()}
          </Row>
        ) : null}
      </Col>
    );
  };

  const showCodeTypeChangeConfirmation = (scriptCodeType) => {
    if (scriptCodeType === script.codeType) return;

    setCodeTypeSelection(scriptCodeType);
    setIsCodeTypePopupVisible(true);
  };

  const showScriptDeleteConfirmation = () => {
    setIsScriptDeletePopupVisible(true);
  };

  const onCodeTypeChange = (codeType) => {
    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: {
          [`scripts[${scriptIndex}].codeType`]: codeType,
          [`scripts[${scriptIndex}].value`]: "",
        },
      })
    );
  };

  const handleScriptDelete = (e) => {
    deleteScript(e, pairIndex, scriptIndex);
  };

  const renderCodeEditor = () => {
    const scriptBodyChangeHandler = (value) => {
      if (isAppCompatibleToAttributesForScriptRule) {
        const { code, attributes, err } = parseScriptCodeValue(value, script);
        console.log("code", code);
        console.log("attributes", attributes);
        if (err) {
          console.error("Error parsing code", err);
          dispatch(
            actions.triggerToastForEditor({
              id: pair.id,
              message: err,
              type: "error",
            })
          );
          return;
        }

        dispatch(
          actions.updateRulePairAtGivenPath({
            pairIndex,
            triggerUnsavedChangesIndication: !isCodeFormatted,
            updates: {
              [`scripts[${scriptIndex}].value`]: code,
              [`scripts[${scriptIndex}].attributes`]: attributes,
            },
          })
        );
      } else {
        dispatch(
          actions.updateRulePairAtGivenPath({
            pairIndex,
            triggerUnsavedChangesIndication: !isCodeFormatted,
            updates: {
              [`scripts[${scriptIndex}].value`]: value,
            },
          })
        );
      }
    };

    const handleCodeFormattedFlag = () => {
      setIsCodeFormatted(true);
      setTimeout(() => {
        setIsCodeFormatted(false);
      }, 2000);
    };

    return (
      <Col span={24} data-tour-id="code-editor">
        <Row
          key={rowIndex}
          span={24}
          style={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Col xl="12" span={24}>
            <CodeEditor
              id={pair.id}
              language={script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS ? "javascript" : "css"}
              defaultValue={scriptEditorBoilerCode}
              value={getPresentableEditorValue}
              handleChange={scriptBodyChangeHandler}
              readOnly={isInputDisabled}
              isCodeFormatted={isCodeFormatted}
            />
          </Col>
        </Row>
        <Row span={24} align="middle" justify="space-between" className="code-editor-character-count-row ">
          <Col align="left">
            {script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS ? (
              <Button type="link" onClick={handleCodeFormattedFlag}>
                Pretty Print {"{ }"}
              </Button>
            ) : null}
          </Col>
          <Col span={6} align="right">
            <span className="codemirror-character-count text-gray">{script.value?.length ?? 0} characters</span>
          </Col>
        </Row>
      </Col>
    );
  };

  const scriptTypeChangeHandler = (newScriptType) => {
    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: {
          [`scripts[${scriptIndex}].type`]: newScriptType,
          [`scripts[${scriptIndex}].value`]: "",
        },
      })
    );
  };

  const loadTimeMenuItems = useMemo(
    () => [
      {
        title: "After Page Load",
        type: GLOBAL_CONSTANTS.SCRIPT_LOAD_TIME.AFTER_PAGE_LOAD,
      },
      {
        title: "Before Page Load",
        type: GLOBAL_CONSTANTS.SCRIPT_LOAD_TIME.BEFORE_PAGE_LOAD,
      },
    ],
    []
  );

  const handleLoadTimeClick = useCallback(
    (type) =>
      dispatch(
        actions.updateRulePairAtGivenPath({
          pairIndex,
          updates: {
            [`scripts[${scriptIndex}].loadTime`]: type,
          },
        })
      ),
    [dispatch, pairIndex, scriptIndex]
  );

  const loadTimeMenu = (
    <Menu>
      {loadTimeMenuItems.map(({ title, type }, index) => (
        <Menu.Item key={index} onClick={(e) => handleLoadTimeClick(type)}>
          {title}
        </Menu.Item>
      ))}
    </Menu>
  );

  const scriptTypeMenuItems = useMemo(
    () => [
      {
        title: "URL",
        type: GLOBAL_CONSTANTS.SCRIPT_TYPES.URL,
      },
      {
        title: "Custom Code",
        type: GLOBAL_CONSTANTS.SCRIPT_TYPES.CODE,
      },
    ],
    []
  );

  const scriptTypeMenu = (
    <Menu>
      {scriptTypeMenuItems.map(({ title, type }, index) => (
        <Menu.Item key={index} onClick={(e) => scriptTypeChangeHandler(type)}>
          {title}
        </Menu.Item>
      ))}
    </Menu>
  );

  const scriptCodeTypeMenuItems = useMemo(
    () => [
      {
        title: "JavaScript",
        type: GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS,
      },
      {
        title: "CSS",
        type: GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS,
      },
    ],
    []
  );

  const scriptCodeTypeMenu = (
    <Menu>
      {scriptCodeTypeMenuItems.map(({ title, type }, index) => (
        <Menu.Item key={index} onClick={() => showCodeTypeChangeConfirmation(type)}>
          {title}
        </Menu.Item>
      ))}
    </Menu>
  );

  const CodeTypeOptions = () => {
    return (
      <Popconfirm
        title="This will clear the existing code"
        onConfirm={() => {
          onCodeTypeChange(codeTypeSelection);
          setIsCodeTypePopupVisible(false);
        }}
        onCancel={() => {
          setIsCodeTypePopupVisible(false);
        }}
        okText="Confirm"
        cancelText="Cancel"
        visible={isCodeTypePopupVisible}
      >
        <Dropdown overlay={scriptCodeTypeMenu} disabled={isInputDisabled}>
          <Text strong className="cursor-pointer uppercase ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            {script.codeType} <DownOutlined />
          </Text>
        </Dropdown>
      </Popconfirm>
    );
  };

  return (
    <div key={rowIndex} className={!isLastIndex ? "custom-script-row" : ""}>
      <Row span={24} align="middle" className="code-editor-header-row mt-20">
        <Col span={22}>
          <Row align="middle" className="items-center" gutter={[20, 20]}>
            <Col align="left" data-tour-id="rule-editor-script-language">
              <Text className="text-gray">Language: </Text>
              <CodeTypeOptions />
            </Col>
            <Col align="left">
              <Text className="text-gray">Code Source: </Text>
              <Dropdown overlay={scriptTypeMenu} disabled={isInputDisabled}>
                <Text strong className="cursor-pointer uppercase ant-dropdown-link" onClick={(e) => e.preventDefault()}>
                  {script.type} <DownOutlined />
                </Text>
              </Dropdown>
            </Col>
            {script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS ? (
              <Col align="left">
                <Text className="text-gray">Insert: </Text>
                <Dropdown overlay={loadTimeMenu} disabled={isInputDisabled}>
                  <Text
                    strong
                    className="cursor-pointer ant-dropdown-link"
                    onClick={(e) => e.preventDefault()}
                    style={{ textTransform: "capitalize" }}
                  >
                    {script.loadTime === GLOBAL_CONSTANTS.SCRIPT_LOAD_TIME.AFTER_PAGE_LOAD
                      ? "After Page Load"
                      : "Before Page Load"}{" "}
                    <DownOutlined />
                  </Text>
                </Dropdown>
              </Col>
            ) : null}
          </Row>
        </Col>
        {!isInputDisabled && (
          <Col align="right" className="flex-1">
            <Popconfirm
              title="This will clear the existing script"
              onConfirm={(e) => {
                handleScriptDelete(e);
                setIsScriptDeletePopupVisible(false);
              }}
              onCancel={() => {
                setIsScriptDeletePopupVisible(false);
              }}
              okText="Confirm"
              cancelText="Cancel"
              visible={isScriptDeletePopupVisible}
            >
              <Tooltip title="Remove">
                <DeleteOutlined
                  id="delete-pair"
                  color="text-gray cursor-pointer"
                  onClick={showScriptDeleteConfirmation}
                />
              </Tooltip>
            </Popconfirm>
          </Col>
        )}
      </Row>
      {script.type === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL ? renderURLInput() : renderCodeEditor()}
    </div>
  );
};

export default CustomScriptRow;
