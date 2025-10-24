import React, { ReactElement, memo, useCallback, useMemo, useState } from "react";
import { Radio, RadioChangeEvent, Tooltip } from "antd";
import { trackRawResponseViewed } from "modules/analytics/events/features/apiClient";
import { getEditorLanguageFromContentType } from "componentsV2/CodeEditor";
import "./responseBody.scss";
import Editor from "componentsV2/CodeEditor";

interface Props {
  responseText: string;
  contentTypeHeader: string;
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

const ResponseBody: React.FC<Props> = ({ responseText, contentTypeHeader }) => {
  const [responseMode, setResponseMode] = useState(ResponseMode.PREVIEW);

  const onResponseModeChange = useCallback((e: RadioChangeEvent) => {
    const responseMode: ResponseMode = e.target.value;
    setResponseMode(responseMode);

    if (responseMode === ResponseMode.RAW) {
      trackRawResponseViewed();
    }
  }, []);

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
          value={responseText}
          language={editorLanguage}
          isReadOnly
          responseMode={responseMode}
          toolbarOptions={{
            title: "",
            options: [bodyPreviewModeOptions],
          }}
        />
      </div>
    );
  }, [contentTypeHeader, responseText, bodyPreviewModeOptions]);

  return (
    <div className="api-client-response-body">
      <div className="api-response-body-content">{preview}</div>
    </div>
  );
};

export default memo(ResponseBody);
