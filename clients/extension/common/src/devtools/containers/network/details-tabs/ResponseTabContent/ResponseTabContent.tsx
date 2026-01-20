import React, { useCallback, useEffect, useState } from "react";
import { RQNetworkEvent, RuleEditorUrlFragment } from "../../../../types";
import { createRule, generateRuleName, getBaseUrl, isContentBodyEditable } from "../../../../utils";
import { Button, Collapse, Tooltip } from "antd";
import { SourceKey, SourceOperator } from "../../../../../types";
import { EditOutlined } from "@ant-design/icons";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { markdown } from "@codemirror/lang-markdown";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import "./responseTabContent.scss";

interface Props {
  networkEvent: RQNetworkEvent;
}

const mimeTypeToLangugageMap: { [mimeType: string]: any } = {
  "application/json": json(),
  "text/javascript": javascript({ jsx: false }),
  "application/javascript": javascript({ jsx: false }),
  "text/html": html(),
  "text/css": css(),
};

const getEditorLanguageFromMimeType = (mimeType: string) => {
  const language = mimeTypeToLangugageMap[mimeType.toLowerCase().split(";")?.[0]];

  return language || markdown();
};

const commonExtensions = [EditorView.lineWrapping];

const ResponseTabContent: React.FC<Props> = ({ networkEvent }) => {
  const [response, setResponse] = useState("");
  const [editorExtensions, setEditorExtensions] = useState([...commonExtensions, markdown()]);

  useEffect(() => {
    networkEvent.getContent((content) => {
      if (content) {
        try {
          setResponse(JSON.stringify(JSON.parse(content), null, 2) || "");
        } catch (e) {
          setResponse(content);
        }
      } else {
        setResponse("");
      }

      const language = getEditorLanguageFromMimeType(networkEvent.response?.content?.mimeType);
      setEditorExtensions([...commonExtensions, language]);
    });
  }, [networkEvent]);

  const editResponseBody = useCallback(() => {
    createRule(
      RuleEditorUrlFragment.RESPONSE,
      (rule) => {
        const baseUrl = getBaseUrl(networkEvent.request.url);
        rule.pairs[0].source = {
          key: SourceKey.URL,
          operator: SourceOperator.CONTAINS,
          value: baseUrl,
        };
        // @ts-ignore
        rule.pairs[0].response = {
          type: "static",
          value: response || "{}",
          resourceType: "restApi",
          statusCode: "",
        };

        if (networkEvent?.metadata?.graphQLDetails) {
          const { operationName } = networkEvent.metadata.graphQLDetails;

          rule.pairs[0].source.filters = [
            // @ts-ignore
            {
              requestPayload: {
                key: "operationName",
                value: operationName,
              },
            },
          ];

          // @ts-ignore
          rule.pairs[0].response.resourceType = "graphqlApi";
        }

        rule.name = generateRuleName("Modify Response Body");
        rule.description = `Modify Response Body of ${baseUrl}`;
      },
      ""
    );
  }, [networkEvent, response]);

  const renderEditResponseBodyButton = useCallback(() => {
    if (isContentBodyEditable(networkEvent._resourceType)) {
      return (
        <Button
          onClick={(e) => {
            editResponseBody();
            e.stopPropagation();
          }}
          icon={<EditOutlined />}
        >
          Edit Response Body
        </Button>
      );
    }

    return (
      <Tooltip title="Only XHR/Fetch requests can be modified">
        <Button disabled icon={<EditOutlined />}>
          Edit Response Body
        </Button>
      </Tooltip>
    );
  }, [networkEvent, response]);

  return (
    <div className="response-tab-content">
      <Collapse bordered={false}>
        <Collapse.Panel
          collapsible="icon"
          key="response-body"
          showArrow={false}
          header={"Response Body"}
          extra={renderEditResponseBodyButton()}
        ></Collapse.Panel>
      </Collapse>
      <CodeMirror
        basicSetup={{
          lineNumbers: true,
          syntaxHighlighting: true,
        }}
        theme={vscodeDark}
        value={response}
        height="95%"
        extensions={editorExtensions}
        readOnly
      />
    </div>
  );
};

export default ResponseTabContent;
