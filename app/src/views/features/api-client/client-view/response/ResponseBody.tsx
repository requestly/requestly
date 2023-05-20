import React, { ReactElement, memo, useCallback, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@devtools-ds/themes";
import { ObjectInspector } from "@devtools-ds/object-inspector";
import { Radio, RadioChangeEvent } from "antd";
import { trackRawResponseViewed } from "modules/analytics/events/features/apiClient";

interface Props {
  responseText: string;
  contentTypeHeader: string;
}

enum ResponseMode {
  RAW,
  PREVIEW,
}

const JSONResponsePreview: React.FC<{ responseText: string }> = ({ responseText }) => {
  const [responseJSON, setResponseJSON] = useState(null);

  useEffect(() => {
    if (responseText) {
      try {
        const sanitizedJsonString = /[[{][\s\S]*$/.exec(responseText)?.[0] || responseText; // removes padded characters before JSON
        const json = JSON.parse(sanitizedJsonString);
        setResponseJSON(json);
      } catch (e) {
        setResponseJSON(null);
      }
    }
  }, [responseText]);

  return (
    <ThemeProvider theme={"chrome"} colorScheme={"dark"}>
      <ObjectInspector data={responseJSON} expandLevel={1} includePrototypes={false} className="api-response-json" />
    </ThemeProvider>
  );
};

const HTMLResponsePreview: React.FC<{ responseText: string }> = ({ responseText }) => {
  return <iframe title="HTML Response Preview" className="html-response-preview" sandbox="" srcDoc={responseText} />;
};

const ImageResponsePreview: React.FC<{ responseText: string; mimeType: string }> = ({ responseText, mimeType }) => {
  return <img src={responseText} className="image-response-preview" alt="Response" />;
};

const ResponseBody: React.FC<Props> = ({ responseText, contentTypeHeader }) => {
  const [responseMode, setResponseMode] = useState(ResponseMode.PREVIEW);

  const preview = useMemo<ReactElement>(() => {
    if (contentTypeHeader?.includes("application/json")) {
      return <JSONResponsePreview responseText={responseText} />;
    }

    if (contentTypeHeader?.includes("text/html")) {
      return <HTMLResponsePreview responseText={responseText} />;
    }

    if (contentTypeHeader?.includes("image/")) {
      return <ImageResponsePreview responseText={responseText} mimeType={contentTypeHeader} />;
    }

    return null;
  }, [contentTypeHeader, responseText]);

  const onResponseModeChange = useCallback((e: RadioChangeEvent) => {
    const responseMode: ResponseMode = e.target.value;
    setResponseMode(responseMode);

    if (responseMode === ResponseMode.RAW) {
      trackRawResponseViewed();
    }
  }, []);

  return (
    <div className="api-response-body">
      {preview ? (
        <Radio.Group value={responseMode} onChange={onResponseModeChange} size="small" style={{ marginBottom: 8 }}>
          <Radio.Button value={ResponseMode.PREVIEW}>Preview</Radio.Button>
          <Radio.Button value={ResponseMode.RAW}>Raw</Radio.Button>
        </Radio.Group>
      ) : null}
      <div className="api-response-body-content">
        {preview && responseMode === ResponseMode.PREVIEW ? preview : <pre>{responseText}</pre>}
      </div>
    </div>
  );
};

export default memo(ResponseBody);
