import React, { useEffect, useMemo, useState } from "react";

import { ThemeProvider } from "@devtools-ds/themes";
import { ObjectInspector } from "@devtools-ds/object-inspector";
import { NetworkLogProperty } from "./NetworkLogProperty";

type Props = {
  label?: string;
  payload?: any;
  isPayloadTooLarge?: boolean;
  fetchPayload?: () => Promise<any>;
};

export const NetworkPayload: React.FC<Props> = ({ label, payload, fetchPayload }) => {
  const [fetching, setFetching] = useState(false);
  const [finalPayload, setFinalPayload] = useState<any>();
  useEffect(() => {
    if (payload) {
      if (typeof payload === "string") {
        try {
          return JSON.parse(payload);
        } catch (e) {
          // skip
        }
      }
      setFinalPayload(payload);
    } else if (fetchPayload && typeof fetchPayload === "function") {
      setFetching(true);
      fetchPayload()
        .then((fetchedPayload) => {
          if (typeof fetchedPayload === "string") {
            try {
              setFinalPayload(JSON.parse(fetchedPayload));
            } catch (e) {
              setFinalPayload(fetchedPayload);
            }
          } else {
            setFinalPayload(fetchedPayload);
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [payload, fetchPayload]);

  if (fetching) {
    return <NetworkLogProperty label={label}>Loading...</NetworkLogProperty>;
  }

  if (typeof finalPayload === "object") {
    return (
      <NetworkLogProperty label={label}>
        <ThemeProvider theme={"chrome"} colorScheme={"dark"}>
          <ObjectInspector data={finalPayload} includePrototypes={false} className="network-payload-object" />
        </ThemeProvider>
      </NetworkLogProperty>
    );
  }

  if (finalPayload && typeof finalPayload === "string") {
    return (
      <NetworkLogProperty label={label} isCodeBlock>
        {finalPayload}
      </NetworkLogProperty>
    );
  }

  return null;
};
