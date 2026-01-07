// This should only contain the UI of the Editor.
// On changes, this should call onSave() which is passed as props to this component.
// onSave should actually do all the interaction with the database.

import { AutoComplete, Col, InputNumber, Row, Select } from "antd";
import { RQEditorTitle } from "../../../../../lib/design-system/components/RQEditorTitle";
import { MockEditorHeader } from "./Header";
import { Tabs } from "antd";
import APP_CONSTANTS from "config/constants";
import React, { ReactNode, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { toast } from "utils/Toast";
import { FileType, MockType, RQMockCollection } from "../../types";
import type { TabsProps } from "antd";
import { generateFinalUrl } from "../../utils";
import { requestMethodDropdownOptions } from "../constants";
import { MockEditorDataSchema, RequestMethod, ValidationErrors } from "../types";
import { cleanupEndpoint, getEditorLanguage, validateEndpoint, validateHeaders, validateStatusCode } from "../utils";
import "./index.css";
import { trackMockEditorOpened, trackTestMockClicked } from "modules/analytics/events/features/mocksV2";
import { APIClientModal, APIClientRequest } from "features/apiClient/components/common/APIClient";
import MockEditorEndpoint from "./Endpoint";
import { trackRQDesktopLastActivity, trackRQLastActivity } from "utils/AnalyticsUtils";
import { MOCKSV2 } from "modules/analytics/events/features/constants";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { BottomSheetLayout, BottomSheetProvider } from "componentsV2/BottomSheet";
import MockLogs from "./BottomSheet/MockLogs";
import { BottomSheetFeatureContext, SheetLayout } from "componentsV2/BottomSheet/types";
import { useFeatureValue } from "@growthbook/growthbook-react";
import { ExportMocksModalWrapper } from "features/mocks/modals";
import { globalActions } from "store/slices/global/slice";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import Editor from "componentsV2/CodeEditor";

interface Props {
  isNew?: boolean;
  isEditorReadOnly?: boolean;
  savingInProgress?: boolean;
  mockData?: MockEditorDataSchema;
  mockCollectionData?: RQMockCollection;
  onSave: Function;
  onClose: Function;
  mockType?: MockType;
  isEditorOpenInModal?: boolean;
  isMockCollectionLoading?: boolean;
}

const MockEditor: React.FC<Props> = ({
  isNew = false,
  isEditorReadOnly = false,
  isEditorOpenInModal = false,
  isMockCollectionLoading = false,
  savingInProgress = false,
  mockData,
  mockCollectionData,
  onSave = () => {},
  onClose = () => {},
  mockType,
}) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const username = user?.details?.username;

  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const areLogsVisible = useFeatureValue("mock_logs", false);

  const [id] = useState<string>(mockData.id); // No need to edit this. Set by firebase
  const [type] = useState<MockType>(mockData?.type || mockType);
  const [name, setName] = useState<string>(mockData.name);
  const [desc, setDesc] = useState<string>(mockData.desc);
  const [method, setMethod] = useState<RequestMethod>(mockData.method);
  const [latency, setLatency] = useState<number>(mockData.latency);
  const [statusCode, setStatusCode] = useState<number>(mockData.statusCode);
  const [contentType, setContentType] = useState<string>(mockData.contentType);
  const [endpoint, setEndpoint] = useState<string>(mockData.endpoint);
  const [headersString, setHeadersString] = useState<string>(JSON.stringify(mockData.headers));
  const [body, setBody] = useState<string>(mockData.body);
  const [password, setPassword] = useState<string>(mockData.password ?? "");

  const [fileType] = useState<FileType>(mockData?.fileType || null);
  const [errors, setErrors] = useState<ValidationErrors>({
    name: null,
    statusCode: null,
    endpoint: null,
    headers: null,
  });

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const collectionPath = mockCollectionData?.path ?? "";

  const finalUrl = useMemo(
    () =>
      generateFinalUrl({
        endpoint,
        uid: user?.details?.profile?.uid,
        username,
        teamId: activeWorkspaceId,
        password,
        collectionPath,
      }),
    [endpoint, activeWorkspaceId, user?.details?.profile?.uid, username, password, collectionPath]
  );

  const apiRequest = useMemo<APIClientRequest>(() => {
    return {
      url: finalUrl,
      method,
    };
  }, [finalUrl, method]);

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

  const createMockEditorData = useCallback(() => {
    let headersDict: { [key: string]: string } = {};
    try {
      headersDict = JSON.parse(headersString);
    } catch (err) {
      // TODO: Improve this toast message
      toast.error("Error while parsing headers. Creating with empty headers");
      setErrors((prev) => ({ ...prev, headers: "Error while parsing headers" }));
      headersDict = {};
      return;
    }

    const cleanedEndpoint = cleanupEndpoint(endpoint);
    setEndpoint(cleanedEndpoint);

    const tempMockData: MockEditorDataSchema = {
      id: id,
      type: type,
      fileType: fileType,
      name: name,
      desc: desc,
      method: method as RequestMethod,
      latency: latency,
      endpoint: cleanedEndpoint,
      statusCode: statusCode,
      contentType: contentType,
      headers: headersDict,
      body: body || "{}",
      responseId: mockData.responseId,
      password: password,
    };

    return tempMockData;
  }, [
    id,
    type,
    fileType,
    name,
    desc,
    method,
    latency,
    endpoint,
    statusCode,
    contentType,
    headersString,
    body,
    mockData.responseId,
    password,
  ]);

  const validateMockEditorData = useCallback(
    (data: MockEditorDataSchema): boolean => {
      if (!data) return false;
      const updatedErrors: ValidationErrors = {};
      let focusedInvalidFieldRef = null;

      if (!data.name) {
        updatedErrors.name = `${mockType === MockType.FILE ? "File" : "Mock"} name is required`;
      }
      const statusCodeValidationError = validateStatusCode(data.statusCode.toString());
      if (statusCodeValidationError) {
        updatedErrors.statusCode = statusCodeValidationError;
        if (!focusedInvalidFieldRef) focusedInvalidFieldRef = statusCodeRef;
      }

      const headersValidationError = validateHeaders(data.headers);
      if (headersValidationError) {
        updatedErrors.headers = headersValidationError;
      }

      // TODO: Add more validations here for special characters, //, etc.
      const endpointValidationError = validateEndpoint(data.endpoint);
      if (endpointValidationError) {
        updatedErrors.endpoint = endpointValidationError;
        if (!focusedInvalidFieldRef) focusedInvalidFieldRef = endpointRef;
      }

      // No errors found.
      if (Object.keys(updatedErrors).length === 0) {
        setErrors((prev) => ({ ...prev, ...updatedErrors }));
        return true;
      }
      focusedInvalidFieldRef?.current?.focus({ cursor: "end" });
      setErrors((prev) => ({ ...prev, ...updatedErrors }));
      return false;
    },
    [mockType]
  );

  const handleOnSave = useCallback(() => {
    const finalMockData = createMockEditorData();
    const success = validateMockEditorData(finalMockData);

    if (success) {
      onSave(finalMockData);
    } else {
      if (errors.headers) {
        dispatch(
          globalActions.triggerToastForEditor({
            id: `headers-${id}`,
            message: errors.headers,
            type: "error",
          })
        );
      } else {
        toast.error("Please fix the highlighted fields");
      }
    }
  }, [onSave, errors, createMockEditorData, validateMockEditorData, id, dispatch]);

  const handleTest = useCallback(() => {
    setIsTestModalOpen(true);
    trackTestMockClicked();
    trackRQLastActivity(MOCKSV2.TEST_MOCK_CLICKED);
    trackRQDesktopLastActivity(MOCKSV2.TEST_MOCK_CLICKED);
  }, []);

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
          disabled={isEditorReadOnly}
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
          disabled={isEditorReadOnly}
          id="latency"
          size="large"
          type="text"
          max={5000}
          min={0}
          placeholder="Latency"
          value={latency}
          name="latency"
          onChange={handleMockLatencyChange}
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
          disabled={isEditorReadOnly}
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
          status={errors.statusCode ? "error" : ""}
          placeholder="Response Code"
        />
        <span className="field-error-prompt">{errors.statusCode ? errors.statusCode : null}</span>
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
          disabled={isEditorReadOnly}
          id="content-type"
          size="large"
          placeholder="content"
          value={contentType}
          options={APP_CONSTANTS.CONTENT_TYPE}
          onChange={(e) => setContentType(e)}
        />
      </Col>
    );
  };

  const renderEndpoint = () => {
    return (
      <MockEditorEndpoint
        isNew={isNew}
        disabled={isEditorReadOnly}
        errors={errors}
        collectionPath={collectionPath}
        endpoint={endpoint}
        setEndpoint={setEndpoint}
        mockType={mockType}
        ref={endpointRef}
        password={password}
        isMockCollectionLoading={isMockCollectionLoading}
      />
    );
  };

  const renderMetadataRow = (): any => {
    if (type === MockType.FILE) {
      return <Row className="mock-editor-meta-data-row">{renderEndpoint()}</Row>;
    }
    return (
      <>
        <Row className="mock-editor-meta-data-row" gutter={16}>
          {renderMethod()}
          {renderStatusCode()}
          {renderContentType()}
          {renderLatency()}
          {renderEndpoint()}
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
          <Editor
            scriptId={`headers-${id}`} // used to show error toasts created because header invalidation
            isResizable
            height={220}
            value={headersString}
            handleChange={setHeadersString}
            language={EditorLanguage.JSON}
            analyticEventProperties={{ source: "mocks", mock_type: type }}
            isReadOnly={isEditorReadOnly}
          />
        </Col>
      </Row>
    );
  }, [headersString, type, id, isEditorReadOnly]);

  const renderBodyRow = useCallback((): ReactNode => {
    return (
      <Row className="editor-row">
        <Col span={24}>
          <Editor
            isResizable
            height={220}
            value={body}
            handleChange={setBody}
            language={getEditorLanguage(fileType)}
            isReadOnly={isEditorReadOnly}
            prettifyOnInit={true}
            analyticEventProperties={{ source: "mocks", mock_type: mockType }}
            toolbarOptions={{
              title: mockType === MockType.FILE ? "File content" : "",
              options: null,
            }}
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
      return (
        <>
          <Tabs defaultActiveKey="1" items={editors} />
        </>
      );
    } else {
      return <>{renderBodyRow()}</>;
    }
  };

  return (
    <>
      <ExportMocksModalWrapper />

      {areLogsVisible ? (
        <div className="mock-parent mock-editor-layout-container">
          <BottomSheetProvider context={BottomSheetFeatureContext.MOCKS}>
            <MockEditorHeader
              isNewMock={isNew}
              mockType={mockType}
              savingInProgress={savingInProgress}
              handleClose={onClose}
              handleSave={handleOnSave}
              handleTest={handleTest}
              setPassword={setPassword}
              password={password}
              isEditorReadOnly={isEditorReadOnly}
            />
            <BottomSheetLayout
              layout={SheetLayout.SPLIT}
              bottomSheet={<MockLogs mockId={id} />}
              minSize={0}
              hideBottomSheet={!id}
            >
              <Col className="mock-editor-title-container">
                <RQEditorTitle
                  name={name}
                  mode={isNew ? "create" : "edit"}
                  description={desc}
                  namePlaceholder="File name"
                  descriptionPlaceholder="Add your description here."
                  nameChangeCallback={onNameChange}
                  descriptionChangeCallback={onDescriptionChange}
                  tagText={fileType}
                  errors={errors}
                />
              </Col>
              <div className="mock-editor-wrapper">
                <div className="mock-editor-container">
                  <Row className="mock-editor-body">
                    {renderMetadataRow()}
                    {renderMockCodeEditor()}
                  </Row>
                </div>
              </div>
            </BottomSheetLayout>
            {!isNew ? (
              <APIClientModal
                request={apiRequest}
                modalTitle="Test mock endpoint"
                isModalOpen={isTestModalOpen}
                onModalClose={() => setIsTestModalOpen(false)}
              />
            ) : null}
          </BottomSheetProvider>
        </div>
      ) : (
        <div className="overflow-hidden mock-editor-layout-container">
          <MockEditorHeader
            isNewMock={isNew}
            mockType={mockType}
            savingInProgress={savingInProgress}
            handleClose={onClose}
            handleSave={handleOnSave}
            handleTest={handleTest}
            setPassword={setPassword}
            password={password}
            isEditorReadOnly={isEditorReadOnly}
          />
          <Col className="mock-editor-title-container">
            <RQEditorTitle
              disabled={isEditorReadOnly}
              name={name}
              mode={isNew ? "create" : "edit"}
              description={desc}
              namePlaceholder="File name"
              descriptionPlaceholder="Add your description here."
              nameChangeCallback={onNameChange}
              descriptionChangeCallback={onDescriptionChange}
              tagText={fileType}
              errors={errors}
            />
          </Col>
          <div className="mock-editor-wrapper">
            <div className="mock-editor-container">
              <Row className="mock-editor-body">
                {renderMetadataRow()}
                {renderMockCodeEditor()}
              </Row>
            </div>
          </div>
          {!isNew ? (
            <APIClientModal
              request={apiRequest}
              modalTitle="Test mock endpoint"
              isModalOpen={isTestModalOpen}
              onModalClose={() => setIsTestModalOpen(false)}
            />
          ) : null}
        </div>
      )}
    </>
  );
};

export default MockEditor;
