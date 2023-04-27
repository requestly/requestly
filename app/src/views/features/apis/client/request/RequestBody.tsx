import React, { useCallback, useMemo } from "react";
import CodeEditor from "components/misc/CodeEditor";
import { formatJSONString } from "utils/CodeEditorUtils";
import { Button, Input, Radio } from "antd";
import { KeyValuePair, RQAPI, RequestContentType } from "../../types";
import KeyValueForm from "./KeyValueForm";

interface Props {
  body: RQAPI.RequestBody;
  contentType: RequestContentType;
  setBody: (body: RQAPI.RequestBody) => void;
  setContentType: (contentType: RequestContentType) => void;
}

const RequestBody: React.FC<Props> = ({ body, contentType, setBody, setContentType }) => {
  const onClickBeautifyCode = useCallback(() => {
    setBody(formatJSONString(body));
  }, [body, setBody]);

  const bodyEditor = useMemo(() => {
    switch (contentType) {
      case RequestContentType.JSON:
        return (
          // @ts-ignore
          <CodeEditor
            language={"json"}
            value={body}
            handleChange={setBody}
            isCodeFormatted={false}
            isResizable={false}
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
        <div>
          {contentType === RequestContentType.JSON ? (
            <Button type="link" className="beautify-code" onClick={onClickBeautifyCode}>
              Beautify
            </Button>
          ) : null}
        </div>
      </div>
      {bodyEditor}
    </div>
  );
};

export default RequestBody;
