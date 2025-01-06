import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Radio, Select } from "antd";
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
  const [textBody, setTextBody] = useState(
    RequestContentType.RAW === contentType || RequestContentType.JSON === contentType ? body : ""
  );
  const [formBody, setFormBody] = useState(RequestContentType.FORM === contentType ? body : []);

  /*
  when switching between RAW,JSON & Form , setContentype reinitalizes the request body as an empty string, array
  useEffect synchronizes the request body with the parent (setRequestEntry) whenever request body is saved & contentType is changed.
  */
  useEffect(() => {
    let updatedBody: string | KeyValuePair[];

    if (contentType === RequestContentType.RAW || contentType === RequestContentType.JSON) {
      updatedBody = textBody;
    } else if (contentType === RequestContentType.FORM) {
      updatedBody = formBody;
    }

    setRequestEntry((prev) => ({ ...prev, request: { ...prev.request, body: updatedBody } }));
  }, [contentType, textBody, formBody, setRequestEntry]);

  const handleTextChange = useDebounce(
    useCallback(
      (value: string) => {
        setTextBody(value);
        setRequestEntry((prev) => ({ ...prev, request: { ...prev.request, body: value } }));
      },
      [setRequestEntry]
    ),
    500,
    { leading: true, trailing: true }
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

  /*
  Added key prop in codeEditor to force re-render the component when contentType changes
  */
  const bodyEditor = useMemo(() => {
    switch (contentType) {
      case RequestContentType.JSON:
        return (
          <CodeEditor
            key={contentType}
            language={EditorLanguage.JSON}
            defaultValue={textBody as string}
            value={textBody as string}
            handleChange={handleTextChange}
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
            key={contentType}
            language={null}
            defaultValue={textBody as string}
            value={textBody as string}
            handleChange={handleTextChange}
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
  }, [contentType, variables, formBody, handleFormChange, handleTextChange, textBody]);

  /*
  In select, label is used is 'Text' & RequestContentType.RAW is used as value since we have RAW, JSON, Form as types, 
  we are considering RAW & Json as 'Text'
  */
  return (
    <div className="api-request-body">
      <div className="api-request-body-options">
        <Radio.Group
          onChange={(e) => setContentType(e.target.value === "text" ? RequestContentType.RAW : e.target.value)}
          defaultValue={RequestContentType.RAW}
          value={
            contentType === RequestContentType.RAW || contentType === RequestContentType.JSON ? "text" : contentType
          }
        >
          <Radio value="text">Raw</Radio>
          <Radio value={RequestContentType.FORM}>Form</Radio>
        </Radio.Group>

        {contentType === RequestContentType.RAW || contentType === RequestContentType.JSON ? (
          <Select
            className="api-request-body-options-select"
            value={contentType}
            options={[
              { value: RequestContentType.RAW, label: "Text" },
              { value: RequestContentType.JSON, label: "JSON" },
            ]}
            onChange={(value) => setContentType(value)}
            size="small"
          />
        ) : null}
      </div>
      {bodyEditor}
    </div>
  );
};

export default RequestBody;
