import React from "react";
import { EditorLanguage } from "componentsV2/CodeEditor";
import Editor from "componentsV2/CodeEditor/components/Editor/Editor";
import { useMemo, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { Radio } from "antd";
import "./scriptEditor.scss";

interface ScriptEditorProps {
  scripts: RQAPI.Entry["scripts"];
  setScripts: (type: RQAPI.ScriptType, script: string) => void;
}

const DEFAULT_SCRIPT_VALUES = {
  [RQAPI.ScriptType.PRE_REQUEST]: "// Use JavaScript to configure this request dynamically",
  [RQAPI.ScriptType.POST_RESPONSE]: "// Use JavaScript to write tests, visualize response and more",
};

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ scripts, setScripts }) => {
  const [scriptMode, setScriptMode] = useState<RQAPI.ScriptType>(RQAPI.ScriptType.PRE_REQUEST);

  const scriptModeOptions = useMemo(() => {
    return (
      <Radio.Group
        className="api-client-script-type-selector"
        value={scriptMode}
        onChange={(e) => setScriptMode(e.target.value)}
        size="small"
      >
        <Radio.Button className="api-client-script-type-selector__btn" value={RQAPI.ScriptType.PRE_REQUEST}>
          Pre-request
        </Radio.Button>
        <Radio.Button className="api-client-script-type-selector__btn" value={RQAPI.ScriptType.POST_RESPONSE}>
          Post-response
        </Radio.Button>
      </Radio.Group>
    );
  }, [scriptMode]);

  return (
    <div className="api-client-script-editor-container">
      <Editor
        value={scripts?.[scriptMode] || ""}
        handleChange={(value) => setScripts(scriptMode, value)}
        defaultValue={DEFAULT_SCRIPT_VALUES[scriptMode]}
        language={EditorLanguage.JAVASCRIPT}
        toolbarOptions={{
          title: "",
          options: [scriptModeOptions],
        }}
        analyticEventProperties={{ source: "api_client_script_editor" }}
      />
    </div>
  );
};
