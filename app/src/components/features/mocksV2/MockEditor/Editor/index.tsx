// This should only contain the UI of the Editor.
// On changes, this should call onSave() which is passed as props to this component.
// onSave should actually do all the interaction with the database.

import { AutoComplete, Col, Input, InputNumber, Row, Select } from "antd";
import { RQEditorTitle } from "../../../../../lib/design-system/components/RQEditorTitle";
import { MockEditorHeader } from "./Header";
import CodeEditor from "components/misc/CodeEditor";
import CopyButton from "components/misc/CopyButton";
import { Tabs } from "antd";
import APP_CONSTANTS from "config/constants";
import React, {
  ReactNode,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { toast } from "utils/Toast";
import { FileType, MockType } from "../../types";
import type { TabsProps } from "antd";
import { generateFinalUrl } from "../../utils";
import { requestMethodDropdownOptions } from "../constants";
import {
  MockEditorDataSchema,
  RequestMethod,
  ValidationErrors,
} from "../types";
import { getEditorLanguage, validateEndpoint } from "../utils";
import "./index.css";
import { trackMockEditorOpened } from "modules/analytics/events/features/mocksV2";

interface Props {
  isNew?: boolean;
  isEditorReadOnly?: boolean;
  savingInProgress?: boolean;
  mockData?: MockEditorDataSchema;
  onSave: Function;
  onClose: Function;
  mockType?: MockType;
}

const MockEditor: React.FC<Props> = ({
  isNew = false,
  isEditorReadOnly = false,
  savingInProgress = false,
  mockData,
  onSave = () => {},
  onClose = () => {},
  mockType,
}) => {
  const user = useSelector(getUserAuthDetails);
  const username = user?.details?.username;

  const [id] = useState<string>(mockData.id); // No need to edit this. Set by firebase
  const [type] = useState<MockType>(mockData?.type || mockType);
  const [name, setName] = useState<string>(mockData.name);
  const [desc, setDesc] = useState<string>(mockData.desc);
  const [method, setMethod] = useState<RequestMethod>(mockData.method);
  const [latency, setLatency] = useState<number>(mockData.latency);
  const [statusCode, setStatusCode] = useState<number>(mockData.statusCode);
  const [contentType, setContentType] = useState<string>(mockData.contentType);
  const [endpoint, setEndpoint] = useState<string>(mockData.endpoint);
  const [headersString, setHeadersString] = useState<string>(
    JSON.stringify(mockData.headers)
  );
  const [body, setBody] = useState<string>(mockData.body);

  const [fileType] = useState<FileType>(mockData?.fileType || null);
  const [errors, setErrors] = useState<ValidationErrors>({
    name: null,
    statusCode: null,
    endpoint: null,
  });

  //editor fields ref
  const endpointRef = useRef(null);
  const statusCodeRef = useRef(null);

  useEffect(() => {
    trackMockEditorOpened(mockType);
  }, [mockType]);

  const handleMockLatencyChange = (value: number) => {
    if (Number.isInteger(value)) {
      return setLatency(value);
    }
    setLatency(0);
  };

  const createMockEditorData = () => {
    let headersDict: { [key: string]: string } = {};
    try {
      headersDict = JSON.parse(headersString);
    } catch (err) {
      // TODO: Improve this toast message
      toast.error("Error while parsing headers. Creating with empty headers");
      headersDict = {};
    }

    const tempMockData: MockEditorDataSchema = {
      id: id,
      type: type,
      fileType: fileType,
      name: name,
      desc: desc,
      method: method as RequestMethod,
      latency: latency,
      endpoint: endpoint,
      statusCode: statusCode,
      contentType: contentType,
      headers: headersDict,
      body: body || "{}",
      responseId: mockData.responseId,
    };

    return tempMockData;
  };

  const validateMockEditorData = (data: MockEditorDataSchema): boolean => {
    const updatedErrors: ValidationErrors = {};
    let focusedInvalidFieldRef = null;

    if (!data.name) {
      updatedErrors.name = "Name is required";
    }
    if (!data.statusCode) {
      updatedErrors.statusCode = "Status Code is required";
      if (!focusedInvalidFieldRef) focusedInvalidFieldRef = statusCodeRef;
    }
    // TODO: Add more validations here for special characters, //, etc.
    const endpointValidationError = validateEndpoint(data.endpoint);
    if (endpointValidationError) {
      updatedErrors.endpoint = endpointValidationError;
      if (!focusedInvalidFieldRef) focusedInvalidFieldRef = endpointRef;
    }

    // No errors found.
    if (Object.keys(updatedErrors).length === 0) {
      setErrors(updatedErrors);
      return true;
    }
    focusedInvalidFieldRef?.current?.focus({ cursor: "end" });
    setErrors(updatedErrors);
    return false;
  };

  const handleOnSave = () => {
    const finalMockData = createMockEditorData();
    const success = validateMockEditorData(finalMockData);

    if (success) {
      onSave(finalMockData);
    } else {
      toast.error("Please fix the highlighted fields");
    }
  };

  const onNameChange = (name: string) => {
    setName(name);
  };
  const onDescriptionChange = (desc: string) => {
    setDesc(desc);
  };

  const renderMethod = () => {
    return (
      <Col span={6} className="meta-data-option">
        <label className="meta-data-option-label" htmlFor="method">
          Method
        </label>
        <Select
          id="method"
          size="large"
          options={requestMethodDropdownOptions}
          onChange={(e) => setMethod(e)}
          value={method}
          placeholder="Method"
        />
      </Col>
    );
  };

  const renderLatency = () => {
    return (
      <Col span={6} className="meta-data-option">
        <label className="meta-data-option-label" htmlFor="latency">
          Latency
        </label>
        <InputNumber
          id="latency"
          size="large"
          type="text"
          max={5000}
          min={0}
          placeholder="Latency"
          value={latency}
          name="latency"
          onChange={handleMockLatencyChange}
          // @ts-ignore: TS2322
          addonAfter="ms"
        />
      </Col>
    );
  };

  const renderStatusCode = () => {
    return (
      <Col span={6} className="meta-data-option">
        <label htmlFor="status-code" className="meta-data-option-label">
          Status code
        </label>
        <AutoComplete
          ref={statusCodeRef}
          id="status-code"
          size="large"
          options={APP_CONSTANTS.STATUS_CODE}
          defaultValue={statusCode}
          onChange={(e) => setStatusCode(e)}
          filterOption={(inputValue, option: any) => {
            if (option.value) {
              return option.value.includes(inputValue);
            }
          }}
          status={errors.statusCode && !statusCode ? "error" : ""}
          placeholder="Response Code"
        />
        <span className="field-error-prompt">
          {errors.statusCode && !statusCode ? errors.statusCode : null}
        </span>
      </Col>
    );
  };

  const renderContentType = () => {
    return (
      <Col span={6} className="meta-data-option">
        <label htmlFor="content-type" className="meta-data-option-label">
          Content type
        </label>
        <AutoComplete
          id="content-type"
          size="large"
          // @ts-ignore
          type="text"
          placeholder="content"
          value={contentType}
          options={APP_CONSTANTS.CONTENT_TYPE}
          name="type"
          onChange={(e) => setContentType(e)}
        />
      </Col>
    );
  };

  const renderEndpoint = () => {
    return (
      <Col
        span={24}
        className={`meta-data-option ${
          mockType === MockType.API && "addon-option"
        }`}
      >
        <label htmlFor="endpoint" className="meta-data-option-label">
          Endpoint
        </label>
        <Input
          ref={endpointRef}
          required
          id="endpoint"
          addonBefore={
            username
              ? `https://${username}.requestly.dev/`
              : "https://requestly.dev/"
          }
          type="text"
          value={endpoint}
          name="path"
          onChange={(e) => setEndpoint(e.target.value)}
          status={errors.endpoint && !endpoint ? "error" : ""}
          placeholder={errors.endpoint ? errors.endpoint : "Enter endpoint"}
        />
        <span className="field-error-prompt">
          {errors.endpoint && !endpoint ? errors.endpoint : null}
        </span>
      </Col>
    );
  };

  const renderUrl = () => {
    return !isNew ? (
      <Col span={24} className="meta-data-option">
        <label htmlFor="url" className="meta-data-option-label">
          URL
        </label>
        <Input
          id="url"
          addonAfter={
            <CopyButton
              title=""
              copyText={generateFinalUrl(
                endpoint,
                user?.details?.profile?.uid,
                username
              )}
            />
          }
          type="text"
          value={generateFinalUrl(
            endpoint,
            user?.details?.profile?.uid,
            username
          )}
          name="url"
          disabled={true}
        />
      </Col>
    ) : null;
  };

  const renderMetadataRow = (): any => {
    if (type === MockType.FILE) {
      return (
        <Row className="mock-editor-meta-data-row">
          {renderEndpoint()}
          {renderUrl()}
        </Row>
      );
    }
    return (
      <>
        <Row className="mock-editor-meta-data-row" gutter={16}>
          {renderMethod()}
          {renderStatusCode()}
          {renderContentType()}
          {renderLatency()}
          {renderEndpoint()}
          {renderUrl()}
        </Row>
      </>
    );
  };

  const renderHeadersRow = useCallback((): ReactNode => {
    if (type === MockType.FILE) {
      return null;
    }
    return (
      <Row className="editor-row">
        <Col span={24}>
          {/* @ts-ignore */}
          <CodeEditor
            height={220}
            language="json"
            value={headersString}
            readOnly={false}
            handleChange={setHeadersString}
          />
        </Col>
      </Row>
    );
  }, [headersString, type]);

  const renderBodyRow = useCallback((): ReactNode => {
    return (
      <Row className="editor-row">
        <Col span={24}>
          {mockType === MockType.FILE && <h4>Response Body</h4>}
          {/* @ts-ignore */}
          <CodeEditor
            language={getEditorLanguage(fileType)}
            value={body}
            height={220}
            readOnly={isEditorReadOnly}
            handleChange={setBody}
            // HACK TO PREVENT AUTO FORMAT
            isCodeMinified={true}
          />
        </Col>
      </Row>
    );
  }, [body, fileType, isEditorReadOnly, mockType]);

  const editors: TabsProps["items"] = useMemo(
    () => [
      {
        key: "1",
        label: `Response body`,
        children: renderBodyRow(),
      },
      {
        key: "2",
        label: `Response headers (optional)`,
        children: renderHeadersRow(),
      },
    ],
    [renderBodyRow, renderHeadersRow]
  );

  const renderMockCodeEditor = () => {
    if (mockType === MockType.API) {
      return <Tabs defaultActiveKey="1" items={editors} />;
    } else {
      return <>{renderBodyRow()}</>;
    }
  };

  return (
    <>
      <MockEditorHeader
        isNewMock={isNew}
        mockType={mockType}
        savingInProgress={savingInProgress}
        handleClose={onClose}
        handleSave={handleOnSave}
      />
      <RQEditorTitle
        name={name}
        description={desc}
        namePlaceholder={mockType === MockType.API ? "Mock name" : "File name"}
        descriptionPlaceholder="Add your description here."
        nameChangeCallback={onNameChange}
        descriptionChangeCallback={onDescriptionChange}
        errors={errors}
      />
      <Row className="mock-editor-container">
        <Col
          span={22}
          offset={1}
          md={{ offset: 2, span: 20 }}
          lg={{ offset: 4, span: 16 }}
        >
          <Row className="mock-editor-body">
            {renderMetadataRow()}
            {renderMockCodeEditor()}
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default MockEditor;
