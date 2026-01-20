import React from "react";
import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { ScriptEditor } from "../../../../../components/Scripts/components/ScriptEditor/ScriptEditor";
import { RQAPI } from "features/apiClient/types";

interface GraphQLScriptsProps {
  focusPostResponse?: boolean;
}

export const GraphQLScripts: React.FC<GraphQLScriptsProps> = ({ focusPostResponse }) => {
  const [entry, recordId, updateScripts, updateEntry] = useGraphQLRecordStore((state) => [
    state.entry,
    state.recordId,
    state.updateEntryScripts,
    state.updateEntry,
  ]);

  const handleUpdateTests = (testResults: RQAPI.ApiEntryMetaData["testResults"]) => {
    updateEntry({
      ...entry,
      testResults,
    });
  };

  return (
    <div className="graphql-request-tab-content" style={{ height: "inherit" }}>
      <ScriptEditor
        requestId={recordId}
        entry={entry}
        onScriptsChange={updateScripts}
        aiTestsExcutionCallback={handleUpdateTests}
        focusPostResponse={focusPostResponse}
      />
    </div>
  );
};
