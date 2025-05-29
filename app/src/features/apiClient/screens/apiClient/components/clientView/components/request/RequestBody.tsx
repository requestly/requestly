import { Radio, Select } from "antd";
import React, { useMemo } from "react";
import { RQAPI, RequestContentType } from "../../../../../../types";
import { FormBody } from "./renderers/form-body-renderer";
import { RawBody } from "./renderers/raw-body-renderer";
import { RequestBodyContext, RequestBodyStateManager } from "./request-body-state-manager";
import { RequestBodyProps } from "./request-body-types";
import "./requestBody.scss";
function parseSingleModeBody(params: {
  contentType: RequestContentType;
  body: RQAPI.RequestBody;
}): RQAPI.RequestBodyContainer {
  const { contentType, body } = params;
  switch (contentType) {
    case RequestContentType.MULTIPART_FORM:
      return {
        multipartForm: body as RQAPI.RequestFormBody,
      };
    case RequestContentType.FORM_URL_ENCODED:
      return {
        formURLEncoded: body as RQAPI.RequestFormBody,
      };
    case RequestContentType.JSON:
      return {
        text: body as RQAPI.RequestJsonBody,
      };
    case RequestContentType.RAW:
      return {
        text: body as RQAPI.RequestRawBody,
      };
    case RequestContentType.HTML:
      return {
        text: body as RQAPI.RequestHtmlBody,
      };
    case RequestContentType.JAVASCRIPT:
      return {
        text: body as RQAPI.RequestJavascriptBody,
      };
    case RequestContentType.XML:
      return {
        text: body as RQAPI.RequestXmlBody,
      };
    default:
      return {
        text: body as RQAPI.RequestRawBody,
      };
  }
}

const RequestBody: React.FC<RequestBodyProps> = (props) => {
  const { contentType, variables, setRequestEntry, setContentType } = props;

  const requestBodyStateManager = useMemo(
    () =>
      new RequestBodyStateManager(
        props.mode === "multiple"
          ? props.bodyContainer
          : parseSingleModeBody({
              contentType,
              body: props.body,
            })
      ),
    [contentType, props]
  );

  const requestBodyOptions = useMemo(() => {
    return (
      <div className="api-request-body-options">
        <Radio.Group
          onChange={(e) => setContentType(e.target.value === "text" ? RequestContentType.RAW : e.target.value)}
          defaultValue={RequestContentType.RAW}
          value={
            contentType === RequestContentType.RAW || contentType === RequestContentType.JSON ? "text" : contentType
          }
        >
          <Radio value="text">Raw</Radio>
          <Radio value={RequestContentType.FORM_URL_ENCODED}>Form URL Encoded</Radio>
          <Radio value={RequestContentType.MULTIPART_FORM}>Multipart Form</Radio>
        </Radio.Group>

        {contentType === RequestContentType.RAW || contentType === RequestContentType.JSON ? (
          <Select
            popupClassName="api-request-body-options-list"
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
    );
  }, [contentType, setContentType]);

  const bodyEditor = useMemo(() => {
    switch (contentType) {
      case RequestContentType.RAW:
      case RequestContentType.JSON:
      case RequestContentType.HTML:
      case RequestContentType.JAVASCRIPT:
      case RequestContentType.XML:
        return (
          <RawBody
            contentType={contentType}
            environmentVariables={variables}
            setRequestEntry={setRequestEntry}
            editorOptions={requestBodyOptions}
          />
        );

      case RequestContentType.FORM_URL_ENCODED:
      case RequestContentType.MULTIPART_FORM:
        return (
          <FormBody environmentVariables={variables} setRequestEntry={setRequestEntry} contentType={contentType} />
        );

      default:
        return null;
    }
  }, [contentType, variables, setRequestEntry, requestBodyOptions]);

  /*
  In select, label is used is 'Text' & RequestContentType.RAW is used as value since we have RAW, JSON, Form as types,
  we are considering RAW & Json as 'Text'
  */
  return (
    <div className="api-request-body">
      {contentType === RequestContentType.FORM_URL_ENCODED || contentType === RequestContentType.MULTIPART_FORM
        ? requestBodyOptions
        : null}
      <RequestBodyContext.Provider value={{ requestBodyStateManager }}>{bodyEditor}</RequestBodyContext.Provider>
    </div>
  );
};

export default RequestBody;
