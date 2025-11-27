import React from "react";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { useMemo, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { Radio, Tooltip } from "antd";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { DEFAULT_SCRIPT_VALUES } from "features/apiClient/constants";
import Editor from "componentsV2/CodeEditor";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import "./scriptEditor.scss";
import { z } from "zod/v4";
import { GenerateTestsButton } from "../GenerateTestsButton/GenerateTestsButton";
import { AIResultReviewPanel } from "../AIResultReviewPanel/AIResultReviewPanel";

const TestGenerationOutputSchema = z.object({
  text: z
    .string()
    .min(1, "Text explanation cannot be empty")
    .max(2000, "Text explanation is too long")
    .describe("Explanation or guidance message"),

  code: z
    .object({
      language: z.string().describe('Programming language (e.g., "javascript")'),
      content: z.string().describe("The generated test script code"),
    })
    .optional()
    .describe("Code block with generated test script"),
});

interface ScriptEditorProps {
  entry: RQAPI.ApiEntry;
  onScriptsChange: (scripts: RQAPI.ApiEntry["scripts"]) => void;
  focusPostResponse?: boolean;
}
// FIX: Editor does not re-render when scripts are undefined
export const ScriptEditor: React.FC<ScriptEditorProps> = ({ entry, onScriptsChange, focusPostResponse }) => {
  const scripts = entry?.scripts || {
    preRequest: DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.PRE_REQUEST],
    postResponse: DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.POST_RESPONSE],
  };

  const activeScriptType = scripts?.[RQAPI.ScriptType.PRE_REQUEST]
    ? RQAPI.ScriptType.PRE_REQUEST
    : scripts?.[RQAPI.ScriptType.POST_RESPONSE]
    ? RQAPI.ScriptType.POST_RESPONSE
    : RQAPI.ScriptType.PRE_REQUEST;

  const [scriptType, setScriptType] = useState<RQAPI.ScriptType>(activeScriptType);
  const [isGenerateTestPopoverOpen, setIsGenerateTestPopoverOpen] = useState(false);
  const hasPostResponseScript = Boolean(scripts?.[RQAPI.ScriptType.POST_RESPONSE]);

  const { object, isLoading, error, stop, submit, clear } = useObject({
    api: "http://127.0.0.1:5001/requestly-dev/us-central1/ai/test-cases/generate",
    schema: TestGenerationOutputSchema,
  });

  const mergeViewConfig = useMemo(() => {
    const isPostResponseScript = scriptType === RQAPI.ScriptType.POST_RESPONSE;
    const hasGeneratedCode = Boolean(object?.code?.content);

    if (isPostResponseScript && hasGeneratedCode) {
      return {
        incomingValue: object?.code?.content,
        source: "ai",
      };
    }

    return undefined;
  }, [scriptType, object?.code?.content]);

  React.useEffect(() => {
    if (focusPostResponse && hasPostResponseScript) {
      setScriptType(RQAPI.ScriptType.POST_RESPONSE);
    }
  }, [focusPostResponse, hasPostResponseScript]);

  const scriptTypeOptions = useMemo(() => {
    return (
      <div className="api-client-script-editor-actions-container">
        <span>
          <Radio.Group
            className="api-client-script-type-selector"
            value={scriptType}
            onChange={(e) => setScriptType(e.target.value)}
            size="small"
          >
            <Radio.Button className="api-client-script-type-selector__btn" value={RQAPI.ScriptType.PRE_REQUEST}>
              Pre-request
            </Radio.Button>
            <Radio.Button className="api-client-script-type-selector__btn" value={RQAPI.ScriptType.POST_RESPONSE}>
              Post-response
            </Radio.Button>
          </Radio.Group>
          <Tooltip title="Learn more about using scripts in API requests" showArrow={false} placement="right">
            <MdInfoOutline
              className="api-client-script-type-selector__info-icon"
              onClick={() => window.open("https://docs.requestly.com/general/api-client/scripts", "_blank")}
            />
          </Tooltip>
        </span>
        <GenerateTestsButton
          isLoading={isLoading}
          isGenerateTestPopoverOpen={isGenerateTestPopoverOpen}
          togglePopover={setIsGenerateTestPopoverOpen}
          onGenerateClick={(query) => {
            submit({ userQuery: query, apiRecord: entry });
          }}
          disabled={scriptType !== RQAPI.ScriptType.POST_RESPONSE || !entry.response}
          onCancelClick={stop}
        />
      </div>
    );
  }, [scriptType, isGenerateTestPopoverOpen, submit, entry, isLoading, stop]);

  return (
    <div className="api-client-script-editor-container">
      <Editor
        key={`${scriptType}`}
        value={scripts?.[scriptType] || DEFAULT_SCRIPT_VALUES[scriptType]}
        handleChange={(value: string) => onScriptsChange({ ...scripts, [scriptType]: value })}
        language={EditorLanguage.JAVASCRIPT}
        toolbarOptions={{
          title: "",
          options: [scriptTypeOptions],
        }}
        analyticEventProperties={{ source: "api_client_script_editor" }}
        autoFocus={focusPostResponse && scriptType === RQAPI.ScriptType.POST_RESPONSE}
        mergeView={mergeViewConfig}
      />
      {object?.code?.content && (
        <AIResultReviewPanel
          onDiscard={() => clear()}
          onAccept={() => {
            onScriptsChange({ ...scripts, postResponse: object?.code?.content as string });
            clear();
          }}
          onEditInstructions={() => setIsGenerateTestPopoverOpen(true)}
        />
      )}
    </div>
  );
};
