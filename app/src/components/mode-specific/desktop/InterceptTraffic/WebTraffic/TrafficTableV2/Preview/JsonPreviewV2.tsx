import React, { useMemo } from "react";
import { ThemeProvider } from "@devtools-ds/themes";
import { ObjectInspector } from "@devtools-ds/object-inspector";
import { Typography } from "antd";

const MAX_ALLOWED_NETWORK_RESPONSE_SIZE = 200 * 1024; // 200KB
const isWithInLimit = (data: any) => {
  try {
    if (typeof data == "object") {
      return JSON.stringify(data).length < MAX_ALLOWED_NETWORK_RESPONSE_SIZE;
    }
    if (typeof data == "string") {
      return data.length < MAX_ALLOWED_NETWORK_RESPONSE_SIZE;
    }
  } catch (e) {
    // todo: can add custom error to show different text for unsupported preview
  }

  return false;
};

type Props = {
  payload: any;
  logId: string;
};

const JSONPreview: React.FC<Props> = ({ payload, logId }) => {
  const parsedPayload = useMemo(() => {
    try {
      if (isWithInLimit(payload)) {
        if (typeof payload === "string") {
          const parsedObject = JSON.parse(payload);
          return parsedObject;
        }
        return payload;
      }
      return "Response too large / Not supported";
    } catch (e) {
      // skip
    }
    return payload;
  }, [payload]);

  if (typeof parsedPayload === "object") {
    return (
      <ThemeProvider theme={"chrome"} colorScheme={"dark"}>
        <ObjectInspector
          key={logId}
          data={parsedPayload}
          includePrototypes={false}
          className="network-payload-object"
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={"chrome"} colorScheme="light">
      <Typography.Title level={5}>&nbsp; Preview not available</Typography.Title>
    </ThemeProvider>
  );
};

export default JSONPreview;
