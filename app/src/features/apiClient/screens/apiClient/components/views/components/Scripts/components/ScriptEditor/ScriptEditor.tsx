import React, { useCallback, useRef } from "react";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { useMemo, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { Radio, Tooltip } from "antd";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import { RiBox3Line } from "@react-icons/all-files/ri/RiBox3Line";
import { EditorView } from "@codemirror/view";
import { toast } from "utils/Toast";
import "./scriptEditor.scss";
import { DEFAULT_SCRIPT_VALUES } from "features/apiClient/constants";
import Editor from "componentsV2/CodeEditor";
import { LibraryPickerPopover, insertImportStatement, getImportedPackageCount } from "../LibraryPicker";
import { ExternalPackage } from "features/apiClient/helpers/modules/scriptsV2/worker/script-internals/scriptExecutionWorker/globals/packageTypes";
import { trackPackageAdded } from "features/apiClient/helpers/modules/scriptsV2/analytics";

interface ScriptEditorProps {
  scripts: RQAPI.ApiEntry["scripts"];
  onScriptsChange: (scripts: RQAPI.ApiEntry["scripts"]) => void;
  focusPostResponse?: boolean;
}
// FIX: Editor does not re-render when scripts are undefined
export const ScriptEditor: React.FC<ScriptEditorProps> = ({ scripts, onScriptsChange, focusPostResponse }) => {
  const activeScriptType = scripts?.[RQAPI.ScriptType.PRE_REQUEST]
    ? RQAPI.ScriptType.PRE_REQUEST
    : scripts?.[RQAPI.ScriptType.POST_RESPONSE]
    ? RQAPI.ScriptType.POST_RESPONSE
    : RQAPI.ScriptType.PRE_REQUEST;

  const [scriptType, setScriptType] = useState<RQAPI.ScriptType>(activeScriptType);
  const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState(false);
  const editorViewRef = useRef<EditorView | null>(null);
  const hasPostResponseScript = Boolean(scripts?.[RQAPI.ScriptType.POST_RESPONSE]);

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

  const scriptTypeOptions = useMemo(() => {
    return (
      <>
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
      </>
    );
  }, [scriptType]);

  const currentScriptValue = scripts?.[scriptType] || DEFAULT_SCRIPT_VALUES[scriptType];
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
    <div className=" api-client-code-editor-container api-client-script-editor-container">
      <Editor
        key={`${scriptType}`}
        value={scripts?.[scriptType] || DEFAULT_SCRIPT_VALUES[scriptType]}
        handleChange={(value: string) => onScriptsChange({ ...scripts, [scriptType]: value })}
        language={EditorLanguage.JAVASCRIPT}
        toolbarOptions={{
          title: "",
          options: [scriptTypeOptions],
        }}
        toolbarRightContent={libraryPickerButton}
        analyticEventProperties={{ source: "api_client_script_editor" }}
        autoFocus={focusPostResponse && scriptType === RQAPI.ScriptType.POST_RESPONSE}
        onEditorReady={handleEditorReady}
      />
    </div>
  );
};
