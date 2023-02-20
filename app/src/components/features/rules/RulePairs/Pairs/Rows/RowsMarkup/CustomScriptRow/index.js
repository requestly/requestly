import React, { useMemo, useState } from "react";
import {
  Row,
  Col,
  Input,
  Tooltip,
  Typography,
  Menu,
  Dropdown,
  Popconfirm,
  Button,
} from "antd";
//SUB COMPONENTS
import FilePickerModal from "../../../../../../filesLibrary/FilePickerModal";
//Icons
import {
  DeleteOutlined,
  DownOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
//Constants
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import CodeEditor from "components/misc/CodeEditor";
import "./CustomScriptRow.css";
import MockPickerModal from "components/features/mocksV2/MockPickerModal";

const { Text } = Typography;

const CustomScriptRow = ({
  rowIndex,
  pairIndex,
  isLastIndex,
  helperFunctions,
  script,
  scriptIndex,
  ruleDetails,
  isInputDisabled,
}) => {
  const { modifyPairAtGivenPath, deleteScript } = helperFunctions;
  const [isCodeTypePopupVisible, setIsCodeTypePopupVisible] = useState(false);
  const [codeTypeSelection, setCodeTypeSelection] = useState(
    GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS
  );
  const [isScriptDeletePopupVisible, setIsScriptDeletePopupVisible] = useState(
    false
  );
  const [isJSPrettified, setIsJSPrettified] = useState(false);

  const scriptEditorBoilerCode = useMemo(
    () => ({
      JS: 'console.log("Hello World");',
      CSS: "body {\n\t background-color: #fff;\n }",
    }),
    []
  );

  /* TODO: Remove Once Moved to Mockv2 */
  const [isFilePickerModalActive, setIsFilePickerModalActive] = useState(false);
  const toggleFilePickerModal = () => {
    setIsFilePickerModalActive(!isFilePickerModalActive);
  };

  const handleFilePickerAction = (url) => {
    setIsFilePickerModalActive(false);
    modifyPairAtGivenPath(
      undefined,
      pairIndex,
      `scripts[${scriptIndex}].value`,
      url
    );
  };
  /** Remove till here */

  const [isMockPickerVisible, setIsMockPickerVisible] = useState(false);

  const handleMockPickerVisibilityChange = (visible) => {
    setIsMockPickerVisible(visible);
  };

  const handleMockPickerSelectionCallback = (url) => {
    setIsMockPickerVisible(false);
    modifyPairAtGivenPath(
      undefined,
      pairIndex,
      `scripts[${scriptIndex}].value`,
      url
    );
  };

  const renderURLInput = () => {
    return (
      <React.Fragment>
        <Row className="margin-top-one" span={24} gutter={16} align="middle">
          <Col span={2}>
            <span>Source</span>
          </Col>
          <Col span={22}>
            <Input
              style={{ cursor: "pointer" }}
              addonAfter={
                isInputDisabled ? null : (
                  <Tooltip
                    title="Import a existing Mock API"
                    onClick={() => setIsMockPickerVisible(true)}
                  >
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
                modifyPairAtGivenPath(
                  event,
                  pairIndex,
                  `scripts[${scriptIndex}].value`
                )
              }
              value={script.value}
            />
          </Col>
        </Row>
        {/* MODALS */}
        {/* TODO: Remove this once MockV2 Released */}
        {isFilePickerModalActive ? (
          <FilePickerModal
            isOpen={isFilePickerModalActive}
            toggle={toggleFilePickerModal}
            callback={handleFilePickerAction}
          />
        ) : null}
        {/* TODO: Remove Till here */}
        {isMockPickerVisible ? (
          <MockPickerModal
            isVisible={isMockPickerVisible}
            onVisibilityChange={handleMockPickerVisibilityChange}
            mockSelectionCallback={handleMockPickerSelectionCallback}
          />
        ) : null}
      </React.Fragment>
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
    modifyPairAtGivenPath(
      null,
      pairIndex,
      `scripts[${scriptIndex}].codeType`,
      codeType,
      [
        {
          path: `scripts[${scriptIndex}].value`,
          value: "",
        },
      ]
    );
  };

  const handleScriptDelete = (e) => {
    deleteScript(e, pairIndex, scriptIndex);
  };

  const renderCodeEditor = () => {
    const scriptBodyChangeHandler = (value) => {
      modifyPairAtGivenPath(
        undefined,
        pairIndex,
        `scripts[${scriptIndex}].value`,
        value
      );
    };

    const handlePrettifyJS = () => {
      setIsJSPrettified(true);
      setTimeout(() => {
        setIsJSPrettified(false);
      }, 2000);
    };

    return (
      <React.Fragment>
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
              language={
                script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS
                  ? "javascript"
                  : "css"
              }
              defaultValue={
                script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS
                  ? scriptEditorBoilerCode.CSS
                  : scriptEditorBoilerCode.JS
              }
              value={script.value}
              handleChange={scriptBodyChangeHandler}
              readOnly={isInputDisabled}
              isJSPrettified={isJSPrettified}
            />
          </Col>
        </Row>
        <Row
          span={24}
          align="middle"
          justify="space-between"
          className="code-editor-character-count-row "
        >
          <Col align="left">
            {script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS ? (
              <Button type="link" onClick={handlePrettifyJS}>
                Pretty Print {"{ }"}
              </Button>
            ) : null}
          </Col>
          <Col span={6} align="right">
            <span className="codemirror-character-count text-gray">
              {script.value.length} characters
            </span>
          </Col>
        </Row>
      </React.Fragment>
    );
  };

  const scriptTypeChangeHandler = (event, newScriptType) => {
    modifyPairAtGivenPath(
      event,
      pairIndex,
      `scripts[${scriptIndex}].type`,
      newScriptType,
      [
        {
          path: `scripts[${scriptIndex}].value`,
          value: "",
        },
      ]
    );
  };

  const loadTimeOptions = (
    <Menu>
      <Menu.Item key={1}>
        <span
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              `scripts[${scriptIndex}].loadTime`,
              GLOBAL_CONSTANTS.SCRIPT_LOAD_TIME.AFTER_PAGE_LOAD
            )
          }
        >
          After Page Load
        </span>
      </Menu.Item>
      <Menu.Item key={2}>
        <span
          onClick={(event) =>
            modifyPairAtGivenPath(
              event,
              pairIndex,
              `scripts[${scriptIndex}].loadTime`,
              GLOBAL_CONSTANTS.SCRIPT_LOAD_TIME.BEFORE_PAGE_LOAD
            )
          }
        >
          Before Page Load
        </span>
      </Menu.Item>
    </Menu>
  );

  const scriptTimeOptions = (
    <Menu>
      <Menu.Item key={1}>
        <span
          onClick={(event) =>
            scriptTypeChangeHandler(event, GLOBAL_CONSTANTS.SCRIPT_TYPES.URL)
          }
        >
          URL
        </span>
      </Menu.Item>
      <Menu.Item key={2}>
        <span
          onClick={(event) =>
            scriptTypeChangeHandler(event, GLOBAL_CONSTANTS.SCRIPT_TYPES.CODE)
          }
        >
          Custom Code
        </span>
      </Menu.Item>
    </Menu>
  );

  const scriptCodeTypes = (
    <Menu>
      <Menu.Item key={1}>
        <span
          onClick={() =>
            showCodeTypeChangeConfirmation(
              GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS
            )
          }
        >
          JavaScript
        </span>
      </Menu.Item>
      <Menu.Item key={2}>
        <span
          onClick={() =>
            showCodeTypeChangeConfirmation(
              GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS
            )
          }
        >
          CSS
        </span>
      </Menu.Item>
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
        <Dropdown overlay={scriptCodeTypes}>
          <Text
            strong
            className="cursor-pointer uppercase ant-dropdown-link"
            onClick={(e) => e.preventDefault()}
          >
            {script.codeType} <DownOutlined />
          </Text>
        </Dropdown>
      </Popconfirm>
    );
  };

  return (
    <div key={rowIndex} className={!isLastIndex ? "custom-script-row" : ""}>
      <Row span={24} align="middle" className="code-editor-header-row">
        <Col span={5} align="left">
          <Text className="text-gray">Language: </Text>
          <CodeTypeOptions />
        </Col>
        <Col span={6} align="left">
          <Text className="text-gray">Code Source: </Text>
          <Dropdown overlay={scriptTimeOptions} disabled={isInputDisabled}>
            <Text
              strong
              className="cursor-pointer uppercase ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
            >
              {script.type} <DownOutlined />
            </Text>
          </Dropdown>
        </Col>
        {script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS ? (
          <Col span={7} align="left">
            <Text className="text-gray">Insert: </Text>
            <Dropdown overlay={loadTimeOptions} disabled={isInputDisabled}>
              <Text
                strong
                className="cursor-pointer ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
                style={{ textTransform: "capitalize" }}
              >
                {script.loadTime ===
                GLOBAL_CONSTANTS.SCRIPT_LOAD_TIME.AFTER_PAGE_LOAD
                  ? "After Page Load"
                  : "Before Page Load"}{" "}
                <DownOutlined />
              </Text>
            </Dropdown>
          </Col>
        ) : null}
        <Col span={6} align="right">
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
      </Row>
      {script.type === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL
        ? renderURLInput()
        : renderCodeEditor()}
    </div>
  );
};

export default CustomScriptRow;
