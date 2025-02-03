import React, { ReactElement, memo, useCallback, useMemo, useState } from "react";
import { Radio, RadioChangeEvent, Spin, Tooltip } from "antd";
import { trackRawResponseViewed } from "modules/analytics/events/features/apiClient";
import Editor from "componentsV2/CodeEditor/components/EditorV2/Editor";
import { getEditorLanguageFromContentType } from "componentsV2/CodeEditor";
import "./responseBody.scss";
import { EmptyResponsePlaceholder } from "../EmptyResponsePlaceholder/EmptyResponsePlaceholder";
import { RQButton } from "lib/design-system-v2/components";
import { IoMdCopy } from "@react-icons/all-files/io/IoMdCopy";
import { RQAPI } from "features/apiClient/types";

interface Props {
  responseText: string;
  contentTypeHeader: string;
  isLoading: boolean;
  isFailed: boolean;
  onCancelRequest: () => void;
  error?: RQAPI.ExecutionError;
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

const ResponseBody: React.FC<Props> = ({
  responseText,
  contentTypeHeader,
  isLoading,
  isFailed,
  onCancelRequest,
  error,
}) => {
  const [responseMode, setResponseMode] = useState(ResponseMode.PREVIEW);
  const [isResponseCopied, setIsResponseCopied] = useState(false);

  const [isResponseBodyFullScreen, setIsResponseBodyFullScreen] = useState(false);
  const handleFullScreenChange = () => {
    setIsResponseBodyFullScreen((prev) => !prev);
  };

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
      <div className="api-client-code-editor-container api-response-body-editor-container">
        <Editor
          prettifyOnInit
          value={responseText}
          language={editorLanguage}
          isReadOnly
          toolbarOptions={{
            title: "",
            options: [bodyPreviewModeOptions],
          }}
          isFullScreen={isResponseBodyFullScreen}
          onFullScreenChange={handleFullScreenChange}
        />
      </div>
    );
  }, [contentTypeHeader, responseText, bodyPreviewModeOptions, isResponseBodyFullScreen]);

  return (
    <div className="api-client-response-body">
      {isLoading ? (
        <div className="api-client-response__loading-overlay">
          <Spin size="large" tip="Request in progress..." />
          <RQButton onClick={onCancelRequest} className="mt-16">
            Cancel request
          </RQButton>
        </div>
      ) : null}
      {responseText && !isLoading ? (
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
          isFailed={isFailed}
          emptyDescription="Please run a request to see the response"
          error={error}
        />
      )}
    </div>
  );
};

export default memo(ResponseBody);
