import React, { ReactElement, memo, useCallback, useMemo, useState } from "react";
import { Radio, RadioChangeEvent, Tooltip } from "antd";
import { trackRawResponseViewed } from "modules/analytics/events/features/apiClient";
import Editor from "componentsV2/CodeEditor/components/Editor/Editor";
import { getEditorLanguageFromContentType } from "componentsV2/CodeEditor";
import "./responseBody.scss";
import { EmptyResponsePlaceholder } from "../EmptyResponseView/emptyResponseView";
import { RQButton } from "lib/design-system-v2/components";
import { IoMdCopy } from "@react-icons/all-files/io/IoMdCopy";

interface Props {
  responseText: string;
  contentTypeHeader: string;
  isLoading: boolean;
  isFailed: boolean;
  onCancelRequest: () => void;
}

enum ResponseMode {
  RAW,
  PREVIEW,
}

const HTMLResponsePreview: React.FC<{ responseText: string }> = ({ responseText }) => {
  return <iframe title="HTML Response Preview" className="html-response-preview" sandbox="" srcDoc={responseText} />;
};

const ImageResponsePreview: React.FC<{ responseText: string; mimeType: string }> = ({ responseText, mimeType }) => {
  return <img src={responseText} className="image-response-preview" alt="Response" />;
};

const ResponseBody: React.FC<Props> = ({ responseText, contentTypeHeader, isLoading, isFailed, onCancelRequest }) => {
  const [responseMode, setResponseMode] = useState(ResponseMode.PREVIEW);
  const [isResponseCopied, setIsResponseCopied] = useState(false);

  const onResponseModeChange = useCallback((e: RadioChangeEvent) => {
    const responseMode: ResponseMode = e.target.value;
    setResponseMode(responseMode);

    if (responseMode === ResponseMode.RAW) {
      trackRawResponseViewed();
    }
  }, []);

  const onCopyButtonClick = useCallback(() => {
    navigator.clipboard.writeText(responseText);
    setIsResponseCopied(true);
    setTimeout(() => {
      setIsResponseCopied(false);
    }, 1000);
  }, [responseText]);

  const bodyPreviewModeOptions = useMemo(() => {
    return (
      <Radio.Group
        className="api-response-body-mode-selector"
        value={responseMode}
        onChange={onResponseModeChange}
        size="small"
      >
        <Radio.Button className="api-response-body-mode-selector__btn" value={ResponseMode.PREVIEW}>
          Preview
        </Radio.Button>
        <Radio.Button className="api-response-body-mode-selector__btn" value={ResponseMode.RAW}>
          Raw
        </Radio.Button>
      </Radio.Group>
    );
  }, [onResponseModeChange, responseMode]);

  const preview = useMemo<ReactElement>(() => {
    if (contentTypeHeader?.includes("text/html")) {
      return <HTMLResponsePreview responseText={responseText} />;
    }

    if (contentTypeHeader?.includes("image/")) {
      return <ImageResponsePreview responseText={responseText} mimeType={contentTypeHeader} />;
    }

    const editorLanguage = getEditorLanguageFromContentType(contentTypeHeader);

    return (
      <div className="api-response-body-editor-container">
        <Editor
          value={responseText}
          defaultValue={responseText}
          language={editorLanguage}
          isReadOnly
          toolbarOptions={{
            title: "",
            options: [bodyPreviewModeOptions],
          }}
          analyticEventProperties={{ source: "api_client" }}
        />
      </div>
    );
  }, [contentTypeHeader, responseText, bodyPreviewModeOptions]);

  return (
    <div className="api-client-response-body">
      {responseText ? (
        <div className="api-response-body-content">
          {preview && responseMode === ResponseMode.PREVIEW ? (
            preview
          ) : (
            <div className="api-response-body-raw-content">
              <div className="api-response-body-raw-content__header">
                {bodyPreviewModeOptions}
                <Tooltip title={isResponseCopied ? "Copied!" : "Copy"} placement="left" color="#000">
                  <RQButton
                    type="transparent"
                    icon={<IoMdCopy className="copy-raw-response-icon" />}
                    size="small"
                    onClick={onCopyButtonClick}
                  />
                </Tooltip>
              </div>
              <div className="api-response-body-raw-content__body">
                <pre>{responseText}</pre>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyResponsePlaceholder
          isLoading={isLoading}
          isFailed={isFailed}
          onCancelRequest={onCancelRequest}
          emptyDescription="Please run a request to see the response"
        />
      )}
    </div>
  );
};

export default memo(ResponseBody);
