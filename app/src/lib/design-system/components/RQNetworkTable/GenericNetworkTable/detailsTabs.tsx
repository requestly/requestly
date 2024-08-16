import { Collapse } from "antd";
import { DetailsTab } from "@requestly-ui/resource-table";
import { NetworkEntry } from "./types";
import { NetworkLogProperty } from "./components/NetworkLogProperty";
import { NetworkStatusField } from "./components/NetworkStatusField";
import { NetworkPayload } from "./components/NetworkPayload";
// fix-me @nsr: firebase imports should not be here, but couldn't any other way, without a lot of props drilling
import { getFile } from "services/firebaseStorageService";

export const getDefaultDetailsTabs = <NetworkLog,>(networkEntrySelector: (log: NetworkLog) => NetworkEntry) => {
  const detailsTabs: DetailsTab<NetworkLog>[] = [
    {
      key: "headers",
      label: "Headers",
      render: (log: NetworkLog) => {
        const harEntry = networkEntrySelector(log);
        return (
          <Collapse defaultActiveKey={[0, 1, 2]}>
            <Collapse.Panel header="General" key={0}>
              <NetworkLogProperty label="Request URL">{harEntry.request.url}</NetworkLogProperty>

              {!!harEntry.response.redirectURL && harEntry.response.redirectURL !== harEntry.request.url ? (
                <NetworkLogProperty label="Redirected URL">
                  {harEntry.response.redirectURL as string}
                </NetworkLogProperty>
              ) : null}

              <NetworkLogProperty label="Request Method">
                {harEntry.request.method?.toUpperCase() ?? "GET"}
              </NetworkLogProperty>

              <NetworkLogProperty label="Status Code">
                <NetworkStatusField
                  status={harEntry.response.status}
                  statusText={(harEntry.response?.statusText as string) ?? ""}
                />
              </NetworkLogProperty>
            </Collapse.Panel>

            {harEntry.response.headers.length > 0 && (
              <Collapse.Panel header="Response Headers" key={1}>
                {harEntry.response.headers.map(({ name, value }) => (
                  <NetworkLogProperty key={name} label={name}>
                    {value}
                  </NetworkLogProperty>
                ))}
              </Collapse.Panel>
            )}

            {harEntry.request.headers?.length > 0 && (
              <Collapse.Panel header="Request Headers" key={2}>
                {harEntry.request.headers.map(({ name, value }) => (
                  <NetworkLogProperty key={name} label={name}>
                    {value}
                  </NetworkLogProperty>
                ))}
              </Collapse.Panel>
            )}
          </Collapse>
        );
      },
    },
    {
      key: "payload",
      label: "Payload",
      render: (log: NetworkLog) => {
        const harEntry = networkEntrySelector(log);

        console.log("DBG-4: harEntry", harEntry);

        return (
          <Collapse defaultActiveKey={[0, 1]}>
            {harEntry.request.queryString.length > 0 && (
              <Collapse.Panel header="Query String" key={0}>
                {harEntry.request.queryString.map(({ name, value }) => (
                  <NetworkLogProperty key={name} label={name}>
                    {value}
                  </NetworkLogProperty>
                ))}
              </Collapse.Panel>
            )}
            {(harEntry.request.postData && harEntry.request.postData.text && (
              <Collapse.Panel header="Request Payload" key={1}>
                <NetworkPayload payload={harEntry.request.postData.text} />
              </Collapse.Panel>
            )) ||
              (harEntry._RQ && harEntry._RQ.requestBodyPath && (
                <Collapse.Panel header="Request Payload" key={1}>
                  <NetworkPayload
                    fetchPayload={() =>
                      getFile(harEntry._RQ.requestBodyPath).then((data) => {
                        try {
                          return JSON.parse(JSON.parse(data));
                        } catch {
                          console.log("DBG-3 returned from catch");
                          return data;
                        }
                      })
                    }
                  />
                </Collapse.Panel>
              ))}
          </Collapse>
        );
      },
    },
    {
      key: "response",
      label: "Response",
      render: (log: NetworkLog) => {
        const harEntry = networkEntrySelector(log);
        const responseTimeInSeconds = harEntry.time ? (((harEntry.time as number) ?? 0) / 1000).toFixed(3) : null;

        return (
          <>
            {!!responseTimeInSeconds && (
              <NetworkLogProperty label="Response Time">{responseTimeInSeconds} sec</NetworkLogProperty>
            )}

            {(harEntry.response.content.text && (
              <NetworkPayload label="Body" payload={harEntry.response.content.text} />
            )) ||
              (harEntry._RQ && harEntry._RQ.responseBodyPath && (
                <NetworkPayload label="Body" fetchPayload={() => getFile(harEntry._RQ.responseBodyPath)} />
              ))}
          </>
        );
      },
    },
  ];

  return detailsTabs;
};
