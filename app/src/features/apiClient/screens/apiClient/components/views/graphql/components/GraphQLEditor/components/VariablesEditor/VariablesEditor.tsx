import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { GraphQLEditor } from "../../GraphQLEditor";

export const VariablesEditor = () => {
  const [variables, updateRecordRequest] = useGraphQLRecordStore((state) => [
    state.record.data.request.variables,
    state.updateRecordRequest,
  ]);
  return (
    <GraphQLEditor
      type="variables"
      className="variables-editor"
      initialDoc={variables}
      onChange={(value) => {
        updateRecordRequest({
          variables: value,
        });
      }}
    />
  );
};
