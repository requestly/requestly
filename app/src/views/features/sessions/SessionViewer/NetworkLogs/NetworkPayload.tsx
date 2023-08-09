import React, { useMemo } from "react";
import NetworkLogProperty from "./NetworkLogProperty";
import { ThemeProvider } from "@devtools-ds/themes";
import { ObjectInspector } from "@devtools-ds/object-inspector";

type Props = {
  label: string;
  payload: any;
  isPayloadTooLarge?: boolean;
};

const NetworkPayload: React.FC<Props> = ({ label, payload, isPayloadTooLarge }) => {
  const parsedPayload = useMemo(() => {
    if (typeof payload === "string") {
      try {
        return JSON.parse(payload);
      } catch (e) {
        // skip
      }
    }
    return payload;
  }, [payload]);

  if (!parsedPayload && !isPayloadTooLarge) {
    return null;
  }

  if (typeof parsedPayload === "object") {
    return (
      <NetworkLogProperty label={label}>
        <ThemeProvider theme={"chrome"} colorScheme={"dark"}>
          <ObjectInspector data={parsedPayload} includePrototypes={false} className="network-payload-object" />
        </ThemeProvider>
      </NetworkLogProperty>
    );
  }

  return (
    <NetworkLogProperty label={label} isCodeBlock>
      {isPayloadTooLarge ? "Payload too large to capture" : parsedPayload}
    </NetworkLogProperty>
  );
};

export default NetworkPayload;
