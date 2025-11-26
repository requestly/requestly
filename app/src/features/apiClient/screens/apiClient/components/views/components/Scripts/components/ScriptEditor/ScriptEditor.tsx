import React from "react";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { useMemo, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { Popover, Radio, Tooltip } from "antd";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { DEFAULT_SCRIPT_VALUES } from "features/apiClient/constants";
import Editor from "componentsV2/CodeEditor";
import { AIPromptPopover } from "../AIPromptPopover/AIPromptPopover";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineAutoAwesome } from "@react-icons/all-files/md/MdOutlineAutoAwesome";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import "./scriptEditor.scss";
import { z } from "zod/v4";

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

  // TEMP FLAG
  const showMergeView = true;

  const { object, submit, isLoading, error } = useObject({
    api: "",
    schema: TestGenerationOutputSchema,
  });

  console.log({ obj: object, isLoading, error });

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
        <Popover
          open={isGenerateTestPopoverOpen}
          onOpenChange={setIsGenerateTestPopoverOpen}
          trigger="click"
          content={
            <AIPromptPopover
              isLoading={false}
              isPopoverOpen={isGenerateTestPopoverOpen}
              onGenerateClick={(query) => submit({ userQuery: query, apiRecord: entry })}
              onCancelClick={() => {}}
            />
          }
          placement="bottomRight"
          overlayClassName="ai-generate-test-popover"
          showArrow={false}
        >
          <RQButton
            className="ai-generate-test-btn ai-generate-test-btn__new"
            size="small"
            icon={<MdOutlineAutoAwesome />}
          >
            Generate tests
          </RQButton>
        </Popover>
      </div>
    );
  }, [scriptType, isGenerateTestPopoverOpen, submit, entry]);

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
        mergeConfig={{
          newValue: `
          fetch('https://app.requestly.io/echo')
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error('Error:', err));
        `,
        }}
      />
    </div>
  );
};
