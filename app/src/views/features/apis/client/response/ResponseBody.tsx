import React, { memo, useEffect, useState } from "react";
import { ThemeProvider } from "@devtools-ds/themes";
import { ObjectInspector } from "@devtools-ds/object-inspector";
import { Radio } from "antd";

interface Props {
  responseText: string;
}

enum ResponseMode {
  RAW,
  PREVIEW,
}

const ResponseBody: React.FC<Props> = ({ responseText }) => {
  const [responseJSON, setResponseJSON] = useState(null);
  const [responseMode, setResponseMode] = useState(ResponseMode.RAW);

  useEffect(() => {
    if (responseText) {
      try {
        const json = JSON.parse(responseText);
        setResponseJSON(json);
      } catch (e) {
        setResponseJSON(null);
      }
    }
  }, [responseText]);

  return (
    <div className="api-response-body">
      {responseJSON ? (
        <Radio.Group
          value={responseMode}
          onChange={(e) => setResponseMode(e.target.value)}
          size="small"
          style={{ marginBottom: 8 }}
        >
          <Radio.Button value={ResponseMode.RAW}>Raw</Radio.Button>
          <Radio.Button value={ResponseMode.PREVIEW}>Preview</Radio.Button>
        </Radio.Group>
      ) : null}
      <div className="api-response-body-content">
        {responseMode === ResponseMode.RAW ? (
          <pre>{responseText}</pre>
        ) : (
          <ThemeProvider theme={"chrome"} colorScheme={"dark"}>
            <ObjectInspector data={responseJSON} includePrototypes={false} className="api-response-json" />
          </ThemeProvider>
        )}
      </div>
    </div>
  );
};

export default memo(ResponseBody);
