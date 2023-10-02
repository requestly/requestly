import React, { useMemo } from "react";

import { ThemeProvider } from "@devtools-ds/themes";
import { ObjectInspector } from "@devtools-ds/object-inspector";
import { NetworkLogProperty } from "./NetworkLogProperty";

type Props = {
  label?: string;
  payload: any;
  isPayloadTooLarge?: boolean;
};

export const NetworkPayload: React.FC<Props> = ({ label, payload }) => {
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

  if (typeof parsedPayload === "object") {
    return (
      <NetworkLogProperty label={label}>
        <ThemeProvider theme={"chrome"} colorScheme={"dark"}>
          <ObjectInspector data={parsedPayload} includePrototypes={false} className="network-payload-object" />
        </ThemeProvider>
      </NetworkLogProperty>
    );
  }

  if (payload && typeof payload === "string") {
    return (
      <NetworkLogProperty label={label} isCodeBlock>
        {payload}
      </NetworkLogProperty>
    );
  }

  return null;
};
