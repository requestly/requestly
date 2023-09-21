import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Input, Tooltip, Spin, AutoComplete, Tabs } from "antd";
import { RQEditorTitle } from "lib/design-system/components/RQEditorTitle";
import { MockEditorHeader } from "./Header";
import CopyToClipboard from "react-copy-to-clipboard";
//UTILS
import { getUserAuthDetails } from "../../../../store/selectors";
import { redirectToFiles, redirectToMocks } from "../../../../utils/RedirectionUtils";
//CONSTANTS
import APP_CONSTANTS from "../../../../config/constants";
//TEXT EDITOR
import CodeEditor from "components/misc/CodeEditor";

import ImageViewer from "./ImageViewer";
import { getByteSize } from "../../../../utils/FormattingHelper";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import { getMockUrl, getMockTypeFromUrl, getDelayMockUrl } from "utils/files/urlUtils";
import isEmpty from "is-empty";
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator";
import { useSelector } from "react-redux";
import { toast } from "utils/Toast";
import "../../mocksV2/MockEditorIndex/Editor/index.css";

export const RESOURCE_TYPE_LIST = {
  HTML: "HTML",
  CSS: "CSS",
  JS: "JS",
  IMAGE: "Image",
  MOCK: "API",
};

const FileEditor = (props) => {
  const { newFile } = props;
  // navigate
  const navigate = useNavigate();

  //Global State
  const user = useSelector(getUserAuthDetails);

  //Component State
  const [name, setName] = useState(props.fileDetails ? props.fileDetails.name : "");
  const [contentType, setContentType] = useState(
    props.fileDetails ? props.fileDetails.contentType : "application/json"
  );
  const [method, setMethod] = useState(props.fileDetails ? props.fileDetails.method : "GET");
  const [delayMock, setDelayMock] = useState(props.fileDetails ? (props.fileDetails.delay ? true : false) : false);
  const [delay, setDelay] = useState(props.fileDetails ? props.fileDetails.delay : 0);

  const [mockType, setMockType] = useState(getMockTypeFromUrl(window.location.pathname));
  const [path, setPath] = useState(props.fileDetails ? props.fileDetails.path : "");

  const [randomPathSetOnce, setRandomPathSetOnce] = useState(false);

  const [isCopied, setIsCopied] = useState("Click To Copy");

  const [description, setDescription] = useState(props.fileDetails ? props.fileDetails.description : "");
  const [statusCode, setStatusCode] = useState(props.fileDetails ? props.fileDetails.statusCode : 200);
  const [headers, setHeaders] = useState(props.fileDetails ? JSON.stringify(props.fileDetails.headers) : "{}");
  const [body, setBody] = useState(
    props.fileDetails ? (props.fileDetails.body || props.fileDetails.body === "" ? props.fileDetails.body : "") : ""
  );
  const [isEditorReadOnly, setEditorReadOnly] = useState(false);
  const [isContentLoading, setContentLoading] = useState(false);

  const mockVersion = mockType === RESOURCE_TYPE_LIST.MOCK ? (!path ? "v1" : "v2") : "v0";

  const mockUrlPath = window.location.pathname;

  const serverEditorBoilerCode = useMemo(
    () => ({
      HTML: "<html>\n\t<body>\n\t\t<h1>Hello World</h1>\n\t</body>\n</html>",
      CSS: "body {\n\t background-color: #fff;\n }",
      JS: "console.log('Hello World');",
    }),
    []
  );

  const codeEditorDefaultValue = useMemo(() => {
    switch (mockType) {
      case RESOURCE_TYPE_LIST.JS:
        return serverEditorBoilerCode.JS;

      case RESOURCE_TYPE_LIST.HTML:
        return serverEditorBoilerCode.HTML;

      case RESOURCE_TYPE_LIST.CSS:
        return serverEditorBoilerCode.CSS;

      default:
        return "";
    }
  }, [mockType, serverEditorBoilerCode]);

  const codeEditorLanguage = useMemo(() => {
    switch (mockType) {
      case RESOURCE_TYPE_LIST.MOCK:
        return "json";
      case RESOURCE_TYPE_LIST.JS:
        return "javascript";

      case RESOURCE_TYPE_LIST.HTML:
        return "html";

      case RESOURCE_TYPE_LIST.CSS:
        return "css";

      default:
        return "json";
    }
  }, [mockType]);

  const onBodyChange = (body) => {
    setBody(body);
  };

  const onHeadersChange = (headers) => {
    setHeaders(headers);
  };

  const handleFileExtensionOnChange = (newExtension) => {
    switch (newExtension) {
      case "JS":
        changeResourceType("application/javascript", ".js", mockType);
        return {
          contentType: "application/javascript",
          extension: ".js",
          resourceType: mockType,
        };

      case "HTML":
        changeResourceType("text/html", ".html", mockType);
        return {
          contentType: "text/html",
          extension: ".html",
          resourceType: mockType,
        };

      case "CSS":
        changeResourceType("text/css", ".css", mockType);
        return {
          contentType: "text/css",
          extension: ".css",
          resourceType: mockType,
        };

      case "API":
        changeResourceType(contentType, "", mockType);
        return {
          contentType,
          extension: "",
          resourceType: mockType,
        };

      default:
        break;
    }
  };
  const renderResponseBody = useCallback(() => {
    return (
      <Col span={24} className={`${mockType === RESOURCE_TYPE_LIST.MOCK ? null : "mt-1"}`}>
        {isContentLoading === false ? (
          <CodeEditor
            language={codeEditorLanguage}
            defaultValue={codeEditorDefaultValue}
            value={body || ""}
            readOnly={isEditorReadOnly}
            handleChange={onBodyChange}
          />
        ) : (
          <Col offset={10}>
            <Spin tip="Loading... File Content"></Spin>
          </Col>
        )}
      </Col>
    );
  }, [body, codeEditorDefaultValue, codeEditorLanguage, isContentLoading, isEditorReadOnly, mockType]);
  const changeResourceType = (newType, extension, resourceType) => {
    setContentType(newType);
  };

  const handleMockLatencyChange = (e) => {
    const { value } = e.target;
    const positiveNumberOnlyRegex = /^[0-9]{1,5}$/;

    if (value && !positiveNumberOnlyRegex.test(value)) {
      toast.error("Latency should be a positive number!");
      return;
    }

    setDelayMock(true);
    setDelay(value);
  };

  const getPublicMockUrl = () => {
    if (delayMock) return getDelayMockUrl(props.fileDetails.mockID, delay, user.details.profile.uid);
    return (
      props.fileDetails.shortUrl ||
      getMockUrl(
        props.fileDetails.id ? props.fileDetails.id : props.fileDetails.path,
        props.fileDetails.id ? null : user.details.profile.uid
      )
    );
  };

  const handleFileWrite = () => {
    const isMock = mockType === RESOURCE_TYPE_LIST.MOCK;
    const fileDetails = handleFileExtensionOnChange(mockType);
    const contentType = fileDetails.contentType;
    const extension = fileDetails.extension;

    if (isEmpty(name)) {
      toast.warn("Please give your mock a name");
      return;
    }

    if (isMock && isEmpty(statusCode)) {
      toast.warn("Please enter statusCode");
      return;
    }

    if (!isMock && isEmpty(body) && contentType !== " image") {
      toast.warn("Please enter file content");
      return;
    }

    if (isMock && isEmpty(body)) {
      toast.warn("Please enter response body!");
      return;
    }

    if (headers) {
      try {
        JSON.parse(headers);
      } catch {
        toast.warn("Headers must be a JSON object");
        return;
      }
    }

    if (isMock && getByteSize(body) > APP_CONSTANTS.MOCK_RESPONSE_BODY_CHARACTER_LIMIT) {
      toast.warn("Response Body exceeds character limit");
      return;
    }

    if (mockVersion === "v2" && path !== "" && !path) {
      toast.warn("Please define a Public URL");
      return;
    }

    props.saveFile({
      name,
      contentType,
      description,
      body,
      headers,
      statusCode,
      extension,
      method,
      path,
      delay,
      isMock,
      mockVersion,
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveAndEscFn = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      mockUrlPath.includes("API") || props.fileDetails.isMock === true
        ? redirectToMocks(navigate)
        : redirectToFiles(navigate);
    } else if (event.key === "s" && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) {
      if (!props.saving) {
        event.preventDefault();
        handleFileWrite();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", saveAndEscFn);
    return () => {
      document.removeEventListener("keydown", saveAndEscFn);
    };
  }, [saveAndEscFn]);

  useEffect(() => {
    if (props.fileDetails) {
      if (props.fileDetails.isMock) {
        setMockType("API");
      }
      if (props.fileDetails.contentType === "application/javascript" && !props.fileDetails.isMock) {
        setMockType("JS");
      }
      if (props.fileDetails.contentType === "text/html" && !props.fileDetails.isMock) {
        setMockType("HTML");
      }
      if (props.fileDetails.contentType === "text/css" && !props.fileDetails.isMock) {
        setMockType("CSS");
      }
    }
  }, [props]);

  const fetchFileContent = async () => {
    const response = await fetch(props.fileDetails.webContentLink);
    const data = await response.text();

    if (!Object.prototype.hasOwnProperty.call(props.fileDetails, "body")) {
      setBody(data);
      setEditorReadOnly(true);
      setContentLoading(false);
    }
  };

  const onNameChange = (name) => {
    setName(name);
  };
  const onDescriptionChange = (desc) => {
    setDescription(desc);
  };

  const stableFetchFileContent = useCallback(fetchFileContent, [props.fileDetails]);

  const generateUniqueEndpoint = () => {
    return uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: "",
      length: 3,
      style: "capital",
    });
  };

  if (isEmpty(path)) {
    if (randomPathSetOnce) {
      //do nothing
    } else {
      setPath(generateUniqueEndpoint());
      setRandomPathSetOnce(true);
    }
  }
  const renderHeaderValues = (onHeadersChange, headers) => {
    return (
      <>
        <Row>
          <Col span={24}>
            <CodeEditor
              language="json"
              value={headers || ""}
              defaultValue='"{Header": "Value}"'
              readOnly={false}
              handleChange={onHeadersChange}
            />
          </Col>
        </Row>
      </>
    );
  };

  const editors = useMemo(
    () => [
      {
        key: "1",
        label: `Response body`,
        children: renderResponseBody(),
      },
      {
        key: "2",
        label: `Response headers (optional)`,
        children: renderHeaderValues(onHeadersChange, headers),
      },
    ],
    [headers, renderResponseBody]
  );
  const renderMockCodeEditor = () => {
    if (contentType.startsWith("image")) {
      return (
        <Row>
          <Col className="text-center" span={24} align="center">
            {<ImageViewer src={props.fileDetails.webContentLink} />}
          </Col>
        </Row>
      );
    } else {
      if (mockType === RESOURCE_TYPE_LIST.MOCK) {
        return <Tabs defaultActiveKey="1" items={editors} />;
      } else {
        return renderResponseBody();
      }
    }
  };

  // fetch uploaded file data
  useEffect(() => {
    if (props.fileDetails && !Object.prototype.hasOwnProperty.call(props.fileDetails, "body") && !isEditorReadOnly) {
      stableFetchFileContent();
      setContentLoading(true);
    }
  }, [props.fileDetails, isEditorReadOnly, stableFetchFileContent]);

  return (
    <React.Fragment>
      <MockEditorHeader
        isNewMock={newFile}
        mockType={mockType}
        savingInProgress={props.saving}
        handleSave={handleFileWrite}
        handleClose={() => {
          navigate(-1);
        }}
      />
      <RQEditorTitle
        name={name}
        description={description}
        namePlaceholder={mockType === RESOURCE_TYPE_LIST.MOCK ? "Mock name" : "File name"}
        descriptionPlaceholder="Add your description here."
        nameChangeCallback={onNameChange}
        descriptionChangeCallback={onDescriptionChange}
      />

      <Row className="mock-editor-container">
        <Col
          span={22}
          offset={1}
          md={{ offset: 2, span: 20 }}
          lg={{ offset: 4, span: 16 }}
          className="mock-editor-container-col"
        >
          <Row className="mock-editor-body">
            <Row className="mock-editor-meta-data-row" gutter={16}>
              {mockType === RESOURCE_TYPE_LIST.MOCK ? (
                <>
                  <Col span={6} className="meta-data-option">
                    <label className="meta-data-option-label" htmlFor="method">
                      Method
                    </label>
                    <AutoComplete
                      id="method"
                      size="large"
                      options={APP_CONSTANTS.METHOD_TYPE}
                      defaultValue={method}
                      placeholder="Method"
                      onChange={(e) => setMethod(e)}
                      disabled={!newFile}
                      filterOption={(inputValue, option) => {
                        if (option.value) {
                          return option.value.includes(inputValue);
                        }
                      }}
                    />
                  </Col>
                  <Col span={6} className="meta-data-option">
                    <label className="meta-data-option-label" htmlFor="latency">
                      Latency
                    </label>
                    <Input
                      type="text"
                      maxLength={5}
                      controls={false}
                      placeholder="Latency"
                      value={delay}
                      name="latency"
                      id="latency"
                      onChange={handleMockLatencyChange}
                      addonAfter="ms"
                    />
                  </Col>
                </>
              ) : null}
              {mockType === RESOURCE_TYPE_LIST.MOCK ? (
                <>
                  <Col span={6} className="meta-data-option">
                    <label htmlFor="status-code" className="meta-data-option-label">
                      Status code
                    </label>
                    <AutoComplete
                      id="status-code"
                      size="large"
                      options={APP_CONSTANTS.STATUS_CODE}
                      defaultValue={statusCode}
                      placeholder="Response Code"
                      onChange={(e) => setStatusCode(e)}
                      filterOption={(inputValue, option) => {
                        if (option.value) {
                          return option.value.includes(inputValue);
                        }
                      }}
                    />
                  </Col>
                </>
              ) : null}
              {mockType === RESOURCE_TYPE_LIST.MOCK ? (
                <>
                  <Col span={6} className="meta-data-option">
                    <label htmlFor="content-type" className="meta-data-option-label">
                      Content type
                    </label>
                    <AutoComplete
                      id="content-type"
                      size="large"
                      type="text"
                      placeholder="content"
                      defaultValue={contentType}
                      options={APP_CONSTANTS.CONTENT_TYPE}
                      name="type"
                      onChange={(e) => setContentType(e)}
                    />
                  </Col>
                </>
              ) : null}
              {!props.fileDetails.id && newFile ? (
                <Col span={24} className="meta-data-option mt-1">
                  <label htmlFor="endpoint" className="meta-data-option-label">
                    Endpoint
                  </label>
                  <Input
                    id="endpoint"
                    addonBefore={
                      user?.details?.profile?.uid
                        ? `https://${user?.details?.profile?.uid}.requestly.me/`
                        : "https://user.requestly.me/"
                    }
                    addonAfter={
                      <Tooltip title="Generate Random">
                        <span className="cursor-pointer" onClick={() => setPath(generateUniqueEndpoint())}>
                          <ReloadOutlined />
                        </span>
                      </Tooltip>
                    }
                    type="text"
                    value={path}
                    name="path"
                    onChange={(e) => setPath(e.target.value)}
                    disabled={!newFile}
                  />
                </Col>
              ) : null}
              {/* Show spinner if undefined */}
              {newFile ? null : props.fileDetails.shortUrl || props.fileDetails.mockID ? (
                <Col span={24} className="meta-data-option mt-1">
                  <label htmlFor="endpoint" className="meta-data-option-label">
                    Endpoint
                  </label>
                  <Input
                    id="endpoint"
                    type="text"
                    value={getPublicMockUrl()}
                    onClick={() => setIsCopied("Copied")}
                    disabled={true}
                    addonAfter={
                      <>
                        <CopyToClipboard text={getPublicMockUrl()}>
                          <Tooltip title={isCopied}>
                            <CopyOutlined
                              onClick={() => {
                                setIsCopied("Copied");
                                setTimeout(() => {
                                  setIsCopied("Click To Copy");
                                }, 1000);
                              }}
                            />
                          </Tooltip>
                        </CopyToClipboard>
                      </>
                    }
                  />
                </Col>
              ) : (
                <div>
                  <Spin />
                </div>
              )}
            </Row>
            <>{renderMockCodeEditor()}</>
          </Row>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default FileEditor;
