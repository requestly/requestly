import { Radio, Select } from "antd";
import React, { useMemo } from "react";
import { RequestContentType } from "../../../../../../types";
import { FormBody } from "./renderers/form-body-renderer";
import { RawBody } from "./renderers/raw-body-renderer";
import { RequestBodyContext, RequestBodyStateManager } from "./request-body-state-manager";
import { RequestBodyProps } from "./request-body-types";
import "./requestBody.scss";
import { MultipartFormBodyRenderer } from "./renderers/multipart-form-body-renderer";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import MultipartFormRedirectScreen from "../../../clientView/components/MultipartFormRedirectScreen";

const RequestBody: React.FC<RequestBodyProps> = (props) => {
  const { contentType, recordId, setRequestEntry, setContentType } = props;
  const appMode = useSelector(getAppMode);
  const isFileBodyEnabled = useFeatureIsOn("api_client_file_body_support");

  //Now no mode check should be there, since we rely on bodyContainer only
  const requestBodyStateManager = useMemo(() => {
    return new RequestBodyStateManager(props.bodyContainer);
  }, [props]);

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
            recordId={recordId}
            setRequestEntry={setRequestEntry}
            editorOptions={requestBodyOptions}
          />
        );

      case RequestContentType.FORM:
        return <FormBody recordId={recordId} setRequestEntry={setRequestEntry} />;

      case RequestContentType.MULTIPART_FORM:
        return appMode === "DESKTOP" ? (
          <MultipartFormBodyRenderer recordId={recordId} setRequestEntry={setRequestEntry} />
        ) : (
          <MultipartFormRedirectScreen />
        );

      default:
        return null;
    }
  }, [contentType, recordId, setRequestEntry, requestBodyOptions, appMode]);

  /*
  In select, label is used is 'Text' & RequestContentType.RAW is used as value since we have RAW, JSON, Form as types,
  we are considering RAW & Json as 'Text'
  */
  return (
    <div className="api-request-body-container">
      <div className="api-request-body-radio-btns">
        <Radio.Group
          onChange={(e) => setContentType(e.target.value === "text" ? RequestContentType.RAW : e.target.value)}
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
        <RequestBodyContext.Provider value={{ requestBodyStateManager }}>{bodyEditor}</RequestBodyContext.Provider>
      </div>
    </div>
  );
};

export default RequestBody;
