import React from "react";
import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { ScriptEditor } from "../../../../../components/Scripts/components/ScriptEditor/ScriptEditor";

interface GraphQLScriptsProps {
  focusPostResponse?: boolean;
}

export const GraphQLScripts: React.FC<GraphQLScriptsProps> = ({ focusPostResponse }) => {
  const [scripts, updateScripts] = useGraphQLRecordStore((state) => [state.entry.scripts, state.updateEntryScripts]);

  return (
    <div className="graphql-request-tab-content" style={{ height: "inherit" }}>
      <ScriptEditor scripts={scripts} onScriptsChange={updateScripts} focusPostResponse={focusPostResponse} />
    </div>
  );
};
