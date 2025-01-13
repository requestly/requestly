import React from "react";
import { EditorLanguage } from "componentsV2/CodeEditor";
import Editor from "componentsV2/CodeEditor/components/Editor/Editor";
import { useMemo, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { Radio, Tooltip } from "antd";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import "./scriptEditor.scss";

interface ScriptEditorProps {
  scripts: RQAPI.Entry["scripts"];
  setScripts: (updaterFn: (prev: RQAPI.Entry) => RQAPI.Entry) => void;
}

const DEFAULT_SCRIPT_VALUES = {
  [RQAPI.ScriptType.PRE_REQUEST]:
    "// **********************************************\n// 🛠️ Learn more about scripts and snippets: https://docs.requestly.com/general/api-client/scripts\n// **********************************************\n",
  [RQAPI.ScriptType.POST_RESPONSE]:
    "// **********************************************\n// 🛠️ Use JavaScript to visualize responses: https://docs.requestly.com/general/api-client/scripts\n// **********************************************\n",
};

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ scripts, setScripts }) => {
  const activeScriptType = scripts?.[RQAPI.ScriptType.PRE_REQUEST]
    ? RQAPI.ScriptType.PRE_REQUEST
    : scripts?.[RQAPI.ScriptType.POST_RESPONSE]
    ? RQAPI.ScriptType.POST_RESPONSE
    : RQAPI.ScriptType.PRE_REQUEST;

  const [scriptType, setScriptType] = useState<RQAPI.ScriptType>(activeScriptType);

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

  return (
    <div className=" api-client-code-editor-container api-client-script-editor-container">
      <Editor
        value={scripts?.[scriptType] || ""}
        handleChange={(value) => setScripts((prev) => ({ ...prev, scripts: { ...prev.scripts, [scriptType]: value } }))}
        defaultValue={DEFAULT_SCRIPT_VALUES[scriptType]}
        language={EditorLanguage.JAVASCRIPT}
        toolbarOptions={{
          title: "",
          options: [scriptTypeOptions],
        }}
        analyticEventProperties={{ source: "api_client_script_editor" }}
      />
    </div>
  );
};
