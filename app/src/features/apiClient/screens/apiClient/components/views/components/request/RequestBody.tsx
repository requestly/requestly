import { Radio, Select } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RQAPI, RequestContentType } from "../../../../../../types";
import { FormBody } from "./renderers/form-body-renderer";
import { RawBody } from "./renderers/raw-body-renderer";
import "./requestBody.scss";
import { MultipartFormBodyRenderer } from "./renderers/multipart-form-body-renderer";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import MultipartFormRedirectScreen from "../../../clientView/components/MultipartFormRedirectScreen";
import { BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";

function parseSingleModeBody(params: {
  contentType: RequestContentType;
  body: RQAPI.RequestBody;
}): RQAPI.RequestBodyContainer {
  const { contentType, body } = params;
  switch (contentType) {
    case RequestContentType.FORM:
      return {
        form: body as RQAPI.RequestFormBody,
      };
    case RequestContentType.MULTIPART_FORM:
      return {
        multipartForm: body as RQAPI.MultipartFormBody,
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

type GetBodyReturnType<T extends RequestContentType> = T extends RequestContentType.FORM
  ? RQAPI.RequestFormBody
  : T extends RequestContentType.MULTIPART_FORM
  ? RQAPI.MultipartFormBody
  :
      | RQAPI.RequestJsonBody
      | RQAPI.RequestRawBody
      | RQAPI.RequestHtmlBody
      | RQAPI.RequestJavascriptBody
      | RQAPI.RequestXmlBody;

function getBodyFromBodyContainer<T extends RequestContentType>(
  contentType: T,
  bodyContainer: RQAPI.RequestBodyContainer
): GetBodyReturnType<T> {
  switch (contentType) {
    case RequestContentType.FORM:
      return (bodyContainer.form || []) as GetBodyReturnType<T>;
    case RequestContentType.MULTIPART_FORM:
      return (bodyContainer.multipartForm || []) as GetBodyReturnType<T>;
    case RequestContentType.JSON:
    case RequestContentType.RAW:
    case RequestContentType.HTML:
    case RequestContentType.JAVASCRIPT:
    case RequestContentType.XML:
    default:
      return (bodyContainer.text || "") as GetBodyReturnType<T>;
  }
}

type RequestBodyProps = {
  entity: BufferedHttpRecordEntity;
};

const RequestBody: React.FC<RequestBodyProps> = React.memo((props) => {
  const { entity } = props;
  const recordId = entity.meta.referenceId;
  const contentType = useApiClientSelector((s) => entity.getContentType(s));
  const body = useApiClientSelector((s) => entity.getBody(s));
  const appMode = useSelector(getAppMode);
  const isFileBodyEnabled = useFeatureIsOn("api_client_file_body_support");

  const [bodyContainer, setBodyContainer] = useState<RQAPI.RequestBodyContainer>({
    text: "",
    form: [],
    multipartForm: [],
  });

  useEffect(() => {
    if (!contentType || body === undefined || body === null) {
      return;
    }
    // Initializing the component level states based on the props
    setBodyContainer((prev) => ({ ...prev, ...parseSingleModeBody({ contentType: contentType, body: body }) }));
  }, [contentType, body, setBodyContainer]);

  const handleContentChange = useCallback(
    (_contentType: RequestContentType, body: RQAPI.RequestBody) => {
      entity.setContentType(_contentType);
      entity.setBody(body);
    },
    [entity]
  );

  const handleContentTypeChange = useCallback(
    (contentType: RequestContentType) => {
      handleContentChange(contentType, getBodyFromBodyContainer(contentType, bodyContainer));
    },
    [bodyContainer, handleContentChange]
  );

  const requestBodyOptions = useMemo(() => {
    return (
      <div className="api-request-body-options">
        {contentType === RequestContentType.RAW || contentType === RequestContentType.JSON ? (
          <Select
            popupClassName="api-request-body-options-list"
            className="api-request-body-options-select"
            value={contentType}
            options={[
              { value: RequestContentType.RAW, label: "Text" },
              { value: RequestContentType.JSON, label: "JSON" },
            ]}
            onChange={(value) => handleContentTypeChange(value)}
            size="small"
          />
        ) : null}
      </div>
    );
  }, [contentType, handleContentTypeChange]);

  const bodyEditor = useMemo(() => {
    switch (contentType) {
      case RequestContentType.RAW:
      case RequestContentType.JSON:
      case RequestContentType.HTML:
      case RequestContentType.JAVASCRIPT:
      case RequestContentType.XML:
        return (
          <RawBody
            handleContentChange={handleContentChange}
            contentType={contentType}
            recordId={recordId}
            editorOptions={requestBodyOptions}
            body={getBodyFromBodyContainer(contentType, bodyContainer)}
          />
        );

      case RequestContentType.FORM:
        return (
          <FormBody
            handleContentChange={handleContentChange}
            recordId={recordId}
            contentType={contentType}
            body={getBodyFromBodyContainer(contentType, bodyContainer)}
          />
        );

      case RequestContentType.MULTIPART_FORM:
        return appMode === "DESKTOP" ? (
          <MultipartFormBodyRenderer
            handleContentChange={handleContentChange}
            recordId={recordId}
            contentType={contentType}
            body={getBodyFromBodyContainer(contentType, bodyContainer)}
          />
        ) : (
          <MultipartFormRedirectScreen />
        );

      default:
        return null;
    }
  }, [contentType, recordId, requestBodyOptions, appMode, bodyContainer, handleContentChange]);

  /*
  In select, label is used is 'Text' & RequestContentType.RAW is used as value since we have RAW, JSON, Form as types,
  we are considering RAW & Json as 'Text'
  */
  return (
    <div className="api-request-body-container">
      <div className="api-request-body-radio-btns">
        <Radio.Group
          onChange={(e) => handleContentTypeChange(e.target.value === "text" ? RequestContentType.RAW : e.target.value)}
          defaultValue={RequestContentType.RAW}
          value={
            contentType === RequestContentType.RAW || contentType === RequestContentType.JSON ? "text" : contentType
          }
        >
          <Radio value="text">Raw</Radio>
          <Radio value={RequestContentType.FORM}>x-www-form-urlencoded</Radio>
          {isFeatureCompatible(FEATURES.API_CLIENT_MULTIPART_FORM) && isFileBodyEnabled && (
            <Radio value={RequestContentType.MULTIPART_FORM}>multipart/form-data</Radio>
          )}
        </Radio.Group>
      </div>
      <div className="api-request-body">
        {contentType === RequestContentType.FORM || contentType === RequestContentType.MULTIPART_FORM
          ? requestBodyOptions
          : null}
        {bodyEditor}
      </div>
    </div>
  );
});

export default RequestBody;
