import React, { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { useMemo, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { Radio, Tooltip } from "antd";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { RiBox3Line } from "@react-icons/all-files/ri/RiBox3Line";
import { EditorView } from "@codemirror/view";
import "./scriptEditor.scss";
import { LibraryPickerPopover, insertImportStatement, getImportedPackageCount } from "../LibraryPicker";
import { ExternalPackage } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/scriptExecutionWorker/globals/packageTypes";
import { trackPackageAdded } from "features/apiClient/helpers/modules/scriptsV2/analytics";
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
import { useFeatureValue } from "@growthbook/growthbook-react";
import { AITestGenerationError } from "../AI/types";
import { globalActions } from "store/slices/global/slice";
import { RequestTabLabelIndicator } from "../../../request/components/ApiClientRequestTabs/components/RequestTabLabel/RequestTabLabel";
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
  const dispatch = useDispatch();

  const defaultScripts = {
    preRequest: DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.PRE_REQUEST],
    postResponse: DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.POST_RESPONSE],
  };

  const activeScriptType = entry?.scripts?.[RQAPI.ScriptType.PRE_REQUEST]
    ? RQAPI.ScriptType.PRE_REQUEST
    : entry?.scripts?.[RQAPI.ScriptType.POST_RESPONSE]
    ? RQAPI.ScriptType.POST_RESPONSE
    : RQAPI.ScriptType.PRE_REQUEST;

  const isAITestsGenerationEnabled = useFeatureValue("ai_tests_generation", false);

  const [scriptType, setScriptType] = useState<RQAPI.ScriptType>(activeScriptType);
  const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState(false);
  const editorViewRef = useRef<EditorView | null>(null);
  const [isGenerateTestPopoverOpen, setIsGenerateTestPopoverOpen] = useState(false);
  const [isTestsStreamingFinished, setIsTestsStreamingFinished] = useState(false);
  const [negativeFeedback, setNegativeFeedback] = useState<string | null>(null);
  const [isScriptExecutionInProgress, setIsScriptExecutionInProgress] = useState(false);

  const hasPostResponseScript = Boolean(entry?.scripts?.[RQAPI.ScriptType.POST_RESPONSE]);

  const isPopoverOpenRef = useRef(isGenerateTestPopoverOpen);

  const [getData] = useAPIRecords((state) => [state.getData]);
  const httpRequestExecutor = useHttpRequestExecutor(getData(requestId)?.collectionId);
  const { object, isLoading, error, stop, submit, clear } = useObject({
    api: getAIEndpointUrl(AI_ENDPOINTS.TEST_GENERATION),
    schema: TestGenerationOutputSchema,
    onFinish: (result) => {
      setIsTestsStreamingFinished(true);
      setIsGenerateTestPopoverOpen(false);
      isPopoverOpenRef.current = false;
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
      dispatch(globalActions.updateHasGeneratedAITests(true));
    },
  });

  const handleGenerateTests = (query: string) => {
    setNegativeFeedback(null);
    setIsTestsStreamingFinished(false);
    const preparedApiRecord = {
      ...entry,
      type: entry.type ?? RQAPI.ApiEntryType.HTTP,
    };
    submit({
      userQuery: query,
      apiRecord: preparedApiRecord,
      existingScript: entry.scripts?.postResponse ?? "",
      lastGeneration: { code: object?.code },
    });
  };

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
      preRequest: entry?.scripts?.[RQAPI.ScriptType.PRE_REQUEST] || DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.PRE_REQUEST],
      postResponse: object?.code?.content as string,
    });

    if (onlyAccept) {
      clear();
      return;
    }

    setIsScriptExecutionInProgress(true);
    const newEntry = {
      ...entry,
      scripts: { ...(entry?.scripts || defaultScripts), postResponse: object?.code?.content as string },
    };
    httpRequestExecutor
      .rerun(requestId, newEntry as RQAPI.HttpApiEntry)
      .then((result) => {
        if (result.status === RQAPI.ExecutionStatus.SUCCESS) {
          aiTestsExcutionCallback(result.artifacts.testResults);
          clear();
        } else throw new Error(result.error?.message || "Something went wrong while running tests");
      })
      .catch((error) => {
        toast.error(error.message || "Something went wrong while running tests");
      })
      .finally(() => {
        setIsScriptExecutionInProgress(false);
      });
  };

  React.useEffect(() => {
    if (focusPostResponse && hasPostResponseScript) {
      setScriptType(RQAPI.ScriptType.POST_RESPONSE);
    }
  }, [focusPostResponse, hasPostResponseScript]);

  const handleEditorReady = useCallback((view: EditorView) => {
    editorViewRef.current = view;
  }, []);

  const handlePackageSelect = useCallback((pkg: ExternalPackage) => {
    const result = insertImportStatement(editorViewRef.current ?? undefined, pkg);

    if (result.success) {
      trackPackageAdded(pkg.name, pkg.source);
      toast.success(result.message);
    } else if (result.alreadyImported) {
      toast.info(result.message);
    } else {
      toast.error(result.message);
    }
  }, []);

  const scriptTypeOptions = useMemo(
    () => {
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
                <RequestTabLabelIndicator
                  count={
                    entry?.scripts?.preRequest &&
                    entry?.scripts?.preRequest !== DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.PRE_REQUEST]
                      ? 1
                      : 0
                  }
                  showDot={true}
                />
              </Radio.Button>
              <Radio.Button className="api-client-script-type-selector__btn" value={RQAPI.ScriptType.POST_RESPONSE}>
                Post-response
                <RequestTabLabelIndicator
                  count={
                    entry?.scripts?.postResponse &&
                    entry?.scripts?.postResponse !== DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.POST_RESPONSE]
                      ? 1
                      : 0
                  }
                  showDot={true}
                />
              </Radio.Button>
            </Radio.Group>
            <Tooltip
              title="Learn more about using scripts in API requests"
              showArrow={false}
              placement="right"
              color="#000"
            >
              <MdInfoOutline
                className="api-client-script-type-selector__info-icon"
                onClick={() => window.open("https://docs.requestly.com/general/api-client/scripts", "_blank")}
              />
            </Tooltip>
          </span>
          {isAITestsGenerationEnabled && (
            <Tooltip
              showArrow={false}
              title={!entry?.response ? "Send the request first to generate tests from its response." : null}
              placement="bottom"
              color="#000"
              overlayClassName="ai-generate-test-btn-tooltip"
            >
              <>
                <GenerateTestsButton
                  hidden={scriptType !== RQAPI.ScriptType.POST_RESPONSE}
                  isLoading={isLoading}
                  isGenerateTestPopoverOpen={isGenerateTestPopoverOpen}
                  togglePopover={(open) => {
                    setIsGenerateTestPopoverOpen(open);
                    isPopoverOpenRef.current = open;
                  }}
                  onGenerateClick={handleGenerateTests}
                  disabled={scriptType !== RQAPI.ScriptType.POST_RESPONSE || !entry?.response}
                  onCancelClick={stop}
                  negativeFeedback={negativeFeedback}
                  label={hasPostResponseScript ? "Update with AI" : "Generate tests"}
                />
              </>
            </Tooltip>
          )}
        </div>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      scriptType,
      isGenerateTestPopoverOpen,
      submit,
      entry,
      isLoading,
      stop,
      negativeFeedback,
      isAITestsGenerationEnabled,
      entry?.scripts,
    ]
  );

  const currentScriptValue = entry?.scripts?.[scriptType] || DEFAULT_SCRIPT_VALUES[scriptType];
  const importCount = useMemo(() => getImportedPackageCount(currentScriptValue), [currentScriptValue]);
  const scriptLineCount = useMemo(() => currentScriptValue.split("\n").length, [currentScriptValue]);

  const libraryPickerButton = useMemo(() => {
    return (
      <LibraryPickerPopover
        open={isLibraryPickerOpen}
        onOpenChange={setIsLibraryPickerOpen}
        onPackageSelect={handlePackageSelect}
        scriptLineCount={scriptLineCount}
      >
        <Tooltip title="Browse available packages" placement="top">
          <button className="api-client-script-packages-btn" onClick={() => setIsLibraryPickerOpen(true)}>
            <RiBox3Line />
            <span>Packages</span>
            {importCount > 0 && <span className="api-client-script-packages-btn__count">{importCount}</span>}
          </button>
        </Tooltip>
      </LibraryPickerPopover>
    );
  }, [isLibraryPickerOpen, handlePackageSelect, importCount, scriptLineCount]);

  return (
    <div className="api-client-script-editor-container">
      <Editor
        key={`${scriptType}`}
        value={entry?.scripts?.[scriptType] || DEFAULT_SCRIPT_VALUES[scriptType]}
        handleChange={(value: string) =>
          onScriptsChange({ ...(entry?.scripts || defaultScripts), [scriptType]: value })
        }
        language={EditorLanguage.JAVASCRIPT}
        toolbarOptions={{
          title: "",
          options: [scriptTypeOptions],
        }}
        toolbarRightContent={libraryPickerButton}
        analyticEventProperties={{ source: "api_client_script_editor" }}
        autoFocus={focusPostResponse && scriptType === RQAPI.ScriptType.POST_RESPONSE}
        onEditorReady={handleEditorReady}
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
          isExecutionInProgress={isScriptExecutionInProgress}
        />
      )}
    </div>
  );
};
