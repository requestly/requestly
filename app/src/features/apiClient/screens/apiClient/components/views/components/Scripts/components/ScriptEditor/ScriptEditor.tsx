import React, { useCallback, useEffect, useRef } from "react";
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
import { toast } from "utils/Toast";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { AITestGenerationError } from "../AI/types";
import { globalActions } from "store/slices/global/slice";
import { RequestTabLabelIndicator } from "../../../request/components/ApiClientRequestTabs/components/RequestTabLabel/RequestTabLabel";
import { getAuth } from "firebase/auth";
import firebaseApp from "firebase";
import "./scriptEditor.scss";
import {
  trackAITestGenerationAcceptClicked,
  trackAITestGenerationFailed,
  trackAITestGenerationRejectClicked,
  trackAITestGenerationReviewCompleted,
  trackAITestGenerationSuccessful,
} from "modules/analytics/events/features/apiClient";
import { useAISessionContext } from "features/ai/contexts/AISession";
import { getChunks } from "@codemirror/merge";

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

const defaultScripts = {
  preRequest: DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.PRE_REQUEST],
  postResponse: DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.POST_RESPONSE],
};

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

  const activeScriptType = entry?.scripts?.[RQAPI.ScriptType.PRE_REQUEST]
    ? RQAPI.ScriptType.PRE_REQUEST
    : entry?.scripts?.[RQAPI.ScriptType.POST_RESPONSE]
    ? RQAPI.ScriptType.POST_RESPONSE
    : RQAPI.ScriptType.PRE_REQUEST;

  const isAITestsGenerationEnabled = useFeatureIsOn("ai_tests_generation");
  const isAIEnabledGlobally = useFeatureIsOn("global_ai_support");
  const {
    sessionId,
    lastUsedQuery,
    lastGeneratedCode,
    generationMetrics,
    setLastUsedQuery,
    setLastGeneratedCode,
    getCurrentGenerationId,
    endAISession,
    updateGenerationMetrics,
    getReviewOutcome,
  } = useAISessionContext();

  const [scriptType, setScriptType] = useState<RQAPI.ScriptType>(activeScriptType);
  const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState(false);
  const editorViewRef = useRef<EditorView | null>(null);
  const [isGenerateTestPopoverOpen, setIsGenerateTestPopoverOpen] = useState(false);
  const [isTestsStreamingFinished, setIsTestsStreamingFinished] = useState(false);
  const [negativeFeedback, setNegativeFeedback] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const auth = getAuth(firebaseApp);

  const hasPostResponseScript = Boolean(entry?.scripts?.[RQAPI.ScriptType.POST_RESPONSE]);

  const isPopoverOpenRef = useRef(isGenerateTestPopoverOpen);

  const { object, isLoading, error, stop, submit, clear } = useObject({
    api: getAIEndpointUrl(AI_ENDPOINTS.TEST_GENERATION),
    schema: TestGenerationOutputSchema,
    headers: authToken
      ? {
          Authorization: authToken,
        }
      : {},
    onFinish: (result) => {
      const currentGenerationId = getCurrentGenerationId();
      if (result.object?.err) {
        trackAITestGenerationFailed(sessionId, currentGenerationId);
        endAISession();
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
      } else {
        setIsGenerateTestPopoverOpen(false);
        isPopoverOpenRef.current = false;
        if (result.object?.code?.content) {
          setLastGeneratedCode(result.object.code.content);
          trackAITestGenerationSuccessful(sessionId, currentGenerationId);
        }
      }
      setIsTestsStreamingFinished(true);
      dispatch(globalActions.updateHasGeneratedAITests(true));
      if (editorViewRef.current?.state) {
        const proposedChanges = getChunks(editorViewRef.current?.state);
        updateGenerationMetrics("totalProposedChanges", proposedChanges?.chunks?.length ?? 0);
      }
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
      lastGeneration: {
        code: {
          content: lastGeneratedCode,
          language: "javascript",
        },
        query: lastUsedQuery,
      },
    });
    setLastUsedQuery(query);
  };

  const mergeViewConfig = useMemo(() => {
    const isPostResponseScript = scriptType === RQAPI.ScriptType.POST_RESPONSE;
    const hasGeneratedCode = Boolean(object?.code?.content);

    if (isPostResponseScript && hasGeneratedCode) {
      return {
        incomingValue: object?.code?.content,
        source: "ai",
        onPartialMerge: (mergedValue: string, newIncomingValue: string, type: "accept" | "reject") => {
          setLastGeneratedCode(newIncomingValue);
          const currentGenerationId = getCurrentGenerationId();
          if (type === "accept") {
            onScriptsChange({
              ...(entry?.scripts || defaultScripts),
              postResponse: mergedValue,
            });
            updateGenerationMetrics("acceptedChanges", generationMetrics.acceptedChanges + 1);
            trackAITestGenerationAcceptClicked(sessionId, currentGenerationId);
          } else {
            trackAITestGenerationRejectClicked(sessionId, currentGenerationId);
          }

          if (mergedValue === newIncomingValue) {
            trackAITestGenerationReviewCompleted(
              sessionId,
              currentGenerationId,
              getReviewOutcome(),
              generationMetrics.totalProposedChanges,
              generationMetrics.acceptedChanges
            );
            clear();
            endAISession();
          }
        },
      };
    }

    return undefined;
  }, [
    scriptType,
    object?.code?.content,
    clear,
    onScriptsChange,
    entry?.scripts,
    sessionId,
    getCurrentGenerationId,
    endAISession,
    setLastGeneratedCode,
    generationMetrics,
    updateGenerationMetrics,
    getReviewOutcome,
  ]);

  const handleAcceptTests = () => {
    onScriptsChange({
      preRequest: entry?.scripts?.[RQAPI.ScriptType.PRE_REQUEST] || DEFAULT_SCRIPT_VALUES[RQAPI.ScriptType.PRE_REQUEST],
      postResponse: object?.code?.content as string,
    });
    trackAITestGenerationReviewCompleted(
      sessionId,
      getCurrentGenerationId(),
      "accept_all",
      generationMetrics.totalProposedChanges,
      generationMetrics.totalProposedChanges
    );
    clear();
    endAISession();
  };

  useEffect(() => {
    if (focusPostResponse && hasPostResponseScript) {
      setScriptType(RQAPI.ScriptType.POST_RESPONSE);
    }
  }, [focusPostResponse, hasPostResponseScript]);

  useEffect(() => {
    if (isGenerateTestPopoverOpen) {
      auth.currentUser
        ?.getIdToken()
        .then((token) => {
          setAuthToken(token);
        })
        .catch(() => {
          setAuthToken(null);
        });
    }
  }, [isGenerateTestPopoverOpen, auth.currentUser]);

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
              title={
                !isAIEnabledGlobally ? (
                  <>
                    AI features are disabled for your organization, <a>Contact support</a>.
                  </>
                ) : !entry?.response ? (
                  "Send the request first to generate tests from its response."
                ) : null
              }
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
                  disabled={scriptType !== RQAPI.ScriptType.POST_RESPONSE || !entry?.response || !isAIEnabledGlobally}
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
      isAIEnabledGlobally,
      handleGenerateTests,
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
          onDiscard={() => {
            trackAITestGenerationReviewCompleted(
              sessionId,
              getCurrentGenerationId(),
              getReviewOutcome(),
              generationMetrics.totalProposedChanges,
              generationMetrics.acceptedChanges
            );
            clear();
            endAISession();
          }}
          onAccept={handleAcceptTests}
          onEditInstructions={() => {
            setIsGenerateTestPopoverOpen(true);
            isPopoverOpenRef.current = true;
          }}
        />
      )}
    </div>
  );
};
