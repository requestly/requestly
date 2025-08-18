import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { GraphQLEditor } from "../../GraphQLEditor";

export const VariablesEditor = () => {
  const [variables, updateEntryRequest] = useGraphQLRecordStore((state) => [
    state.entry.request.variables,
    state.updateEntryRequest,
  ]);
  return (
    <GraphQLEditor
      type="variables"
      className="variables-editor"
      initialDoc={variables}
      onChange={(value) => {
        updateEntryRequest({
          variables: value,
        });
      }}
    />
  );
};
