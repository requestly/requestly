/* eslint-disable default-case */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { getDefaultScriptRender, createRenderedScript } from "./utils";

const { Text } = Typography;

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

  const isFirstRender = useRef(true); // to maintain a state for unsaved changes
  const [isCodeTypePopupVisible, setIsCodeTypePopupVisible] = useState(false);
  const [isSourceTypePopupVisible, setIsSourceTypePopupVisible] = useState(false);
  const [codeTypeSelection, setCodeTypeSelection] = useState(GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS);
  const [sourceTypeSelection, setSourceTypeSelection] = useState(GLOBAL_CONSTANTS.SCRIPT_TYPES.CODE);
  const [isScriptDeletePopupVisible, setIsScriptDeletePopupVisible] = useState(false);
  const [isCodeFormatted, setIsCodeFormatted] = useState(false);
  const [initialCodeEditorValue, setInitialCodeEditorValue] = useState(null);

  const isCompatibleWithAttributes = isFeatureCompatible(FEATURES.SCRIPT_RULE.ATTRIBUTES_SUPPORT);

  const scriptEditorBoilerCode = useMemo(() => {
    return getDefaultScriptRender(script.codeType, script.type, isCompatibleWithAttributes);
  }, [script.codeType, script.type, isCompatibleWithAttributes]);

  const codeEditorLanguage = useMemo(() => {
    return isCompatibleWithAttributes
      ? "html"
      : script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS
      ? "javascript"
      : "css";
  }, [script.codeType, isCompatibleWithAttributes]);

  const [isMockPickerVisible, setIsMockPickerVisible] = useState(false);

  useEffect(() => {
    /* USED TO SET THE CORRECT RENDERED VALUE OF THE RULE, ON EVERY UPDATE */
    if (initialCodeEditorValue !== null) return;
    let newValue = script.value;
    if (!script.value) {
      newValue = getDefaultScriptRender(script.codeType, script.type, isCompatibleWithAttributes);
    } else if (!isCompatibleWithAttributes) {
      newValue = script.value;
    } else {
      newValue = createRenderedScript(script.value, script.attributes, script.type, script.codeType);
    }

    setInitialCodeEditorValue(newValue);
  }, [
    initialCodeEditorValue,
    script.value,
    script.attributes,
    script.type,
    script.codeType,
    script.wrapperElement,
    isCompatibleWithAttributes,
  ]);

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
        {isCompatibleWithAttributes ? (
          <Row className="margin-top-one" span={24} gutter={16} align="middle">
            {renderCodeEditor()}
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

  const showSourceTypeChangeConfirmation = (scriptType) => {
    if (scriptType === script.type) return;

    setSourceTypeSelection(scriptType);
    setIsSourceTypePopupVisible(true);
  };

  const showScriptDeleteConfirmation = () => {
    setIsScriptDeletePopupVisible(true);
  };

  const onCodeTypeChange = (codeType) => {
    setInitialCodeEditorValue(null);
    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: {
          [`scripts[${scriptIndex}].codeType`]: codeType,
          [`scripts[${scriptIndex}].value`]: "",
          [`scripts[${scriptIndex}].attributes`]: [],
          [`scripts[${scriptIndex}].wrapperElement`]: null,
        },
      })
    );
  };

  const handleScriptDelete = (e) => {
    deleteScript(e, pairIndex, scriptIndex);
  };

  const handleEditorUpdate = useCallback(
    (value, triggerUnsavedChanges = true) => {
      if (script.type === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL) {
        /* THIS IS TEMPORARY REPRESENTATION OF SCRIPT ATTRIBUTE */
        dispatch(
          actions.updateRulePairAtGivenPath({
            pairIndex,
            updates: {
              [`scripts[${scriptIndex}].wrapperElement`]: value,
            },
            triggerUnsavedChangesIndication: triggerUnsavedChanges,
          })
        );
      } else {
        dispatch(
          actions.updateRulePairAtGivenPath({
            pairIndex,
            triggerUnsavedChangesIndication: !isCodeFormatted && triggerUnsavedChanges,
            updates: {
              [`scripts[${scriptIndex}].value`]: value,
            },
          })
        );
      }
    },
    [dispatch, isCodeFormatted, pairIndex, script.type, scriptIndex]
  );

  useEffect(() => {
    if (initialCodeEditorValue !== null) {
      const shouldTriggerUnsavedChanges = !isFirstRender.current;
      if (isFirstRender.current) {
        isFirstRender.current = false;
      }

      handleEditorUpdate(initialCodeEditorValue, shouldTriggerUnsavedChanges);
    }
  }, [initialCodeEditorValue, handleEditorUpdate]);

  const renderCodeEditor = () => {
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
              id={script.id}
              height={script.type === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL ? 125 : 300}
              language={codeEditorLanguage}
              defaultValue={scriptEditorBoilerCode}
              value={initialCodeEditorValue}
              handleChange={handleEditorUpdate}
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
        <Menu.Item key={index} onClick={(e) => showSourceTypeChangeConfirmation(type)}>
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
        title="Changing the script language will reset the script to default placeholder"
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

  const onSourceTypeChange = (sourceType) => {
    setInitialCodeEditorValue(null);
    dispatch(
      actions.updateRulePairAtGivenPath({
        pairIndex,
        updates: {
          [`scripts[${scriptIndex}].type`]: sourceType,
          [`scripts[${scriptIndex}].value`]: "",
          [`scripts[${scriptIndex}].attributes`]: [],
          [`scripts[${scriptIndex}].wrapperElement`]: null,
        },
      })
    );
  };

  const SourceTypeOptions = () => {
    return (
      <Popconfirm
        title={
          isCompatibleWithAttributes
            ? "Changing the script source will reset the script to default placeholder"
            : "This will clear the updates that you made"
        }
        onConfirm={() => {
          onSourceTypeChange(sourceTypeSelection);
          setIsSourceTypePopupVisible(false);
        }}
        onCancel={() => {
          setIsSourceTypePopupVisible(false);
        }}
        okText="Confirm"
        cancelText="Cancel"
        open={isSourceTypePopupVisible}
      >
        <Dropdown overlay={scriptTypeMenu} disabled={isInputDisabled}>
          <Text strong className="cursor-pointer uppercase ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            {script.type} <DownOutlined />
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
              <SourceTypeOptions />
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
