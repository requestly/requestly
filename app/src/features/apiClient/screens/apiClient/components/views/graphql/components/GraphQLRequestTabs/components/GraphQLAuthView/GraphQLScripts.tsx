import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { ScriptEditor } from "../../../../../components/Scripts/components/ScriptEditor/ScriptEditor";

export const GraphQLScripts = () => {
  const [scripts, updateScripts] = useGraphQLRecordStore((state) => [
    state.record.data.scripts,
    state.updateRecordScripts,
  ]);

  return (
    <div className="graphql-request-tab-content" style={{ height: "inherit" }}>
      <ScriptEditor scripts={scripts} onScriptsChange={updateScripts} />
    </div>
  );
};
