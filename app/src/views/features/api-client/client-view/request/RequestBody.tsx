import React, { useMemo } from "react";
import { Input, Radio } from "antd";
import { KeyValuePair, RQAPI, RequestContentType } from "../../types";
import KeyValueForm from "./KeyValueForm";
import CodeEditor, { EditorLanguage } from "componentsV2/CodeEditor";

interface Props {
  body: RQAPI.RequestBody;
  contentType: RequestContentType;
  setBody: (body: RQAPI.RequestBody) => void;
  setContentType: (contentType: RequestContentType) => void;
}

const RequestBody: React.FC<Props> = ({ body, contentType, setBody, setContentType }) => {
  const bodyEditor = useMemo(() => {
    switch (contentType) {
      case RequestContentType.JSON:
        return (
          // @ts-ignore
          <CodeEditor
            language={EditorLanguage.JSON}
            value={body as string}
            handleChange={setBody}
            isResizable={false}
            hideCharacterCount
          />
        );

      case RequestContentType.FORM:
        return <KeyValueForm keyValuePairs={body as KeyValuePair[]} setKeyValuePairs={setBody} />;

      default:
        return (
          <Input.TextArea
            className="api-request-body-raw"
            placeholder="Enter text here..."
            value={body as string}
            onChange={(e) => setBody(e.target.value)}
          />
        );
    }
  }, [body, contentType, setBody]);

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
