import React, { useRef } from "react";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { useMemo, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { Radio, Tooltip } from "antd";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { DEFAULT_SCRIPT_VALUES } from "features/apiClient/constants";
import Editor from "componentsV2/CodeEditor";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod/v4";
import { GenerateTestsButton } from "../AI/components/GenerateTestsButton/GenerateTestsButton";
import { getAIEndpointUrl, AI_ENDPOINTS } from "config/ai.config";
import { AIResultReviewPanel } from "../AIResultReviewPanel/AIResultReviewPanel";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { useHttpRequestExecutor } from "features/apiClient/hooks/requestExecutors/useHttpRequestExecutor";
import { toast } from "utils/Toast";
import { AITestGenerationError } from "../AI/types";
import "./scriptEditor.scss";

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

  err: z.string().optional().describe("Error code if user request could not be processed"),
});

interface ScriptEditorProps {
  requestId: string;
  entry: RQAPI.ApiEntry;
  onScriptsChange: (scripts: RQAPI.ApiEntryMetaData["scripts"]) => void;
  aiTestsExcutionCallback: (testResults: RQAPI.ApiEntryMetaData["testResults"]) => void;
  focusPostResponse?: boolean;
}
// FIX: Editor does not re-render when scripts are undefined
export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  requestId,
  entry,
  onScriptsChange,
  aiTestsExcutionCallback,
  focusPostResponse,
}) => {
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
  const [isTestsStreamingFinished, setIsTestsStreamingFinished] = useState(false);
  const [negativeFeedback, setNegativeFeedback] = useState<string | null>(null);
  const hasPostResponseScript = Boolean(scripts?.[RQAPI.ScriptType.POST_RESPONSE]);

  const isPopoverOpenRef = useRef(isGenerateTestPopoverOpen);

  const [getData] = useAPIRecords((state) => [state.getData]);
  const httpRequestExecutor = useHttpRequestExecutor(getData(requestId)?.collectionId);
  const { object, isLoading, error, stop, submit, clear } = useObject({
    api: getAIEndpointUrl(AI_ENDPOINTS.TEST_GENERATION),
    schema: TestGenerationOutputSchema,
    onFinish: (result) => {
      setIsTestsStreamingFinished(true);
      if (result.object?.err) {
        switch (result.object?.err) {
          case AITestGenerationError.UNRELATED_QUERY:
            if (!isPopoverOpenRef.current) {
              toast.error("Please provide a query related to test generation.");
            }
            setNegativeFeedback("Please provide a query related to test generation.");
            break;
          case AITestGenerationError.TEST_NOT_REQUESTED:
            if (!isPopoverOpenRef.current) {
              toast.info("The query does not request any tests to be generated.");
            }
            setNegativeFeedback("The query does not request any tests to be generated.");
            break;
          default:
            toast.error("An error occurred while generating tests. Please try again.");
            break;
        }
      }
      setIsTestsStreamingFinished(true);
    },
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

  const handleAcceptAndRunTests = (onlyAccept: boolean) => {
    onScriptsChange({
      preRequest: scripts?.preRequest || DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.PRE_REQUEST],
      postResponse: object?.code?.content as string,
    });

    if (onlyAccept) {
      clear();
      return;
    }

    const newEntry = { ...entry, scripts: { ...scripts, postResponse: object?.code?.content as string } };
    httpRequestExecutor
      .rerun(requestId, newEntry as RQAPI.HttpApiEntry)
      .then((result) => {
        if (result.status === RQAPI.ExecutionStatus.SUCCESS) {
          aiTestsExcutionCallback(result.artifacts.testResults);
          clear();
        } else throw new Error(result.error.message);
      })
      .catch((error) => {
        toast.error(error.message || "Something went wrong while running tests");
      });
  };

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
          togglePopover={(open) => {
            setIsGenerateTestPopoverOpen(open);
            isPopoverOpenRef.current = open;
          }}
          onGenerateClick={(query) => {
            setNegativeFeedback(null);
            setIsTestsStreamingFinished(false);
            submit({ userQuery: query, apiRecord: entry });
          }}
          disabled={scriptType !== RQAPI.ScriptType.POST_RESPONSE || !entry?.response}
          onCancelClick={stop}
          negativeFeedback={negativeFeedback}
        />
      </div>
    );
  }, [scriptType, isGenerateTestPopoverOpen, submit, entry, isLoading, stop, negativeFeedback]);

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
      {isTestsStreamingFinished && object?.code?.content && !error && (
        <AIResultReviewPanel
          onDiscard={() => clear()}
          onAccept={handleAcceptAndRunTests}
          onEditInstructions={() => {
            setIsGenerateTestPopoverOpen(true);
            isPopoverOpenRef.current = true;
          }}
        />
      )}
    </div>
  );
};
