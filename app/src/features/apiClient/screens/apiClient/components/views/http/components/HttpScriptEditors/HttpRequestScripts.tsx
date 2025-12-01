import React from "react";
import { RQAPI } from "features/apiClient/types";
import { ScriptEditor } from "../../../components/Scripts/components/ScriptEditor/ScriptEditor";

interface HttpRequestScriptsProps {
  setEntry: (updater: (prev: RQAPI.HttpApiEntry) => RQAPI.HttpApiEntry) => void;
  requestId: string;
  entry: RQAPI.HttpApiEntry;
  focusPostResponse: boolean;
}

export const HttpRequestScripts: React.FC<HttpRequestScriptsProps> = ({
  requestId,
  entry,
  setEntry,
  focusPostResponse,
}) => {
  return (
    <ScriptEditor
      requestId={requestId}
      entry={entry}
      onScriptsChange={(scripts) => setEntry((prev) => ({ ...prev, scripts }))}
      aiTestsExcutionCallback={(testResults) => setEntry((prev) => ({ ...prev, testResults }))}
      focusPostResponse={focusPostResponse}
    />
  );
};
