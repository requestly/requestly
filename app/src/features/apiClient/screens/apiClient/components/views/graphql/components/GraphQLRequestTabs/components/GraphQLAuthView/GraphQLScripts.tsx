import React, { useCallback } from "react";
import { ScriptEditor } from "../../../../../components/Scripts/components/ScriptEditor/ScriptEditor";
import { BufferedGraphQLRecordEntity } from "features/apiClient/slices/entities";
import { RQAPI } from "features/apiClient/types";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";

interface GraphQLScriptsProps {
  entity: BufferedGraphQLRecordEntity;
  focusPostResponse?: boolean;
}

export const GraphQLScripts: React.FC<GraphQLScriptsProps> = ({ entity, focusPostResponse }) => {
  const entry = useApiClientSelector((s) => entity.getEntityFromState(s).data);

  const handleScriptsChange = useCallback(
    (scripts: { preRequest: string; postResponse: string }) => {
      entity.setScripts(scripts);
    },
    [entity]
  );

  const handleUpdateTests = useCallback(
    (testResults: RQAPI.ApiEntryMetaData["testResults"]) => {
      entity.setTestResults(testResults);
    },
    [entity]
  );

  return (
    <div className="graphql-request-tab-content" style={{ height: "inherit" }}>
      <ScriptEditor
        requestId={entity.meta.referenceId}
        entry={entry}
        onScriptsChange={handleScriptsChange}
        aiTestsExcutionCallback={handleUpdateTests}
        focusPostResponse={focusPostResponse}
      />
    </div>
  );
};
