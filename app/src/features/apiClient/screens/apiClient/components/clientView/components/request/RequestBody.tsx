import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Radio } from "antd";
import { KeyValueFormType, KeyValuePair, RQAPI, RequestContentType } from "../../../../../../types";
import CodeEditor, { EditorLanguage } from "componentsV2/CodeEditor";
import { KeyValueTable } from "./components/KeyValueTable/KeyValueTable";
import { EnvironmentVariables } from "backend/environment/types";
import { useDebounce } from "hooks/useDebounce";

interface Props {
  body: RQAPI.RequestBody;
  contentType: RequestContentType;
  variables: EnvironmentVariables;
  setRequestEntry: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
  setContentType: (contentType: RequestContentType) => void;
}

const RequestBody: React.FC<Props> = ({ body, contentType, variables, setRequestEntry, setContentType }) => {
  const [rawBody, setRawBody] = useState(RequestContentType.RAW === contentType ? body : "");
  const [jsonBody, setJsonBody] = useState(RequestContentType.JSON === contentType ? body : "");
  const [formBody, setFormBody] = useState(RequestContentType.FORM === contentType ? body : []);

  /*
  when switching between RAW,JSON & Form , setContentype reinitalizes the request body as an empty string, array
  useEffect synchronizes the request body with the parent (setRequestEntry) whenever request body is saved & contentType is changed.
  */
  useEffect(() => {
    let updatedBody: string | KeyValuePair[];

    if (contentType === RequestContentType.RAW) {
      updatedBody = rawBody;
    } else if (contentType === RequestContentType.JSON) {
      updatedBody = jsonBody;
    } else if (contentType === RequestContentType.FORM) {
      updatedBody = formBody;
    }

    setRequestEntry((prev) => ({ ...prev, request: { ...prev.request, body: updatedBody } }));
  }, [contentType, rawBody, jsonBody, formBody, setRequestEntry]);

  const handleRawChange = useDebounce(
    useCallback(
      (value: string) => {
        setRawBody(value);
        setRequestEntry((prev) => ({ ...prev, request: { ...prev.request, body: value } }));
      },
      [setRequestEntry]
    ),
    500
  );

  const handleJsonChange = useCallback(
    (value: string) => {
      setJsonBody(value);
      setRequestEntry((prev) => ({ ...prev, request: { ...prev.request, body: value } }));
    },
    [setRequestEntry]
  );

  const handleFormChange = useCallback(
    (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => {
      setRequestEntry((prev) => {
        const updatedEntry = updaterFn(prev);
        setFormBody(updatedEntry.request.body as KeyValuePair[]);
        return {
          ...prev,
          request: {
            ...prev.request,
            body: updatedEntry.request.body,
          },
        };
      });
    },
    [setRequestEntry]
  );

  const bodyEditor = useMemo(() => {
    switch (contentType) {
      case RequestContentType.JSON:
        return (
          <CodeEditor
            language={EditorLanguage.JSON}
            value={jsonBody as string}
            handleChange={handleJsonChange}
            prettifyOnInit={true}
            isResizable={false}
            hideCharacterCount
            analyticEventProperties={{ source: "api_client" }}
            envVariables={variables}
          />
        );

      case RequestContentType.FORM:
        return (
          <KeyValueTable
            pairType={KeyValueFormType.FORM}
            data={formBody as KeyValuePair[]}
            setKeyValuePairs={handleFormChange}
            variables={variables}
          />
        );

      default:
        return (
          <CodeEditor
            language={null}
            value={rawBody as string}
            handleChange={handleRawChange}
            isResizable={false}
            hideCharacterCount
            analyticEventProperties={{ source: "api_client" }}
            envVariables={variables}
            config={{
              enablePrettify: false,
            }}
          />
        );
    }
  }, [contentType, jsonBody, handleJsonChange, variables, formBody, handleFormChange, rawBody, handleRawChange]);

  return (
    <div className="api-request-body">
      <div className="api-request-body-options">
        <Radio.Group
          onChange={(e) => setContentType(e.target.value)}
          defaultValue={RequestContentType.RAW}
          value={contentType}
        >
          <Radio value={RequestContentType.RAW}>Raw</Radio>
          <Radio value={RequestContentType.JSON}>JSON</Radio>
          <Radio value={RequestContentType.FORM}>Form</Radio>
        </Radio.Group>
      </div>
      {bodyEditor}
    </div>
  );
};

export default RequestBody;
