import React, { useCallback, useEffect, useState } from "react";
import { NetworkEvent, RuleEditorUrlFragment } from "../../../../types";
import * as monaco from "monaco-editor";
import Editor, { loader } from "@monaco-editor/react";
import { createRule, generateRuleName, getBaseUrl, isContentBodyEditable } from "../../../../utils";
import { Button, Collapse, Tooltip } from "antd";
import { SourceKey, SourceOperator } from "../../../../../types";
import { EditOutlined } from "@ant-design/icons";
import "./responseTabContent.scss";

interface Props {
  networkEvent: NetworkEvent;
}

loader.config({ monaco });

enum EditorLanguage {
  JSON = "json",
  JAVASCRIPT = "javascript",
  HTML = "html",
  CSS = "css",
}

const mimeTypeToLangugageMap: { [mimeType: string]: EditorLanguage } = {
  "application/json": EditorLanguage.JSON,
  "text/javascript": EditorLanguage.JAVASCRIPT,
  "application/javascript": EditorLanguage.JAVASCRIPT,
  "text/html": EditorLanguage.HTML,
  "text/css": EditorLanguage.CSS,
};

const getEditorLanguageFromMimeType = (mimeType: string) => {
  let language: EditorLanguage = null;

  if (mimeType) {
    language = mimeTypeToLangugageMap[mimeType.toLowerCase().split(";")?.[0]];
  }

  console.log({ language });
  return language || "";
};

const ResponseTabContent: React.FC<Props> = ({ networkEvent }) => {
  const [response, setResponse] = useState(null);
  const [isEditorMount, setIsEditorMount] = useState(false);
  const [editorLangugage, setEditorLanguage] = useState("");

  useEffect(() => {
    networkEvent.getContent((content, encoding) => {
      setResponse(content || "");
      setEditorLanguage(getEditorLanguageFromMimeType(networkEvent.response?.content?.mimeType));
    });
  }, [networkEvent, setResponse, setEditorLanguage]);

  useEffect(() => {
    loader.init().then((module) => module && setIsEditorMount(true));
  }, []);

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
      {isEditorMount && (
        <Editor
          theme={"vs-dark"}
          // language={editorLangugage} // Disabling this as it was causing errors due to workers
          value={response}
          height={"95%"}
          options={{
            scrollbar: {
              alwaysConsumeMouseWheel: false,
            },
            minimap: {
              enabled: false,
            },
            readOnly: true,
            unicodeHighlight: {
              ambiguousCharacters: false,
            },
            wordWrap: "on",
          }}
        />
      )}
    </div>
  );
};

export default ResponseTabContent;
