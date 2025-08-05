import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { GraphQLEditor } from "../../GraphQLEditor";

export const OperationEditor = () => {
  const [operation, updateRecordRequest, introspectionData] = useGraphQLRecordStore((state) => [
    state.record.data.request.operation,
    state.updateRecordRequest,
    state.introspectionData,
  ]);
  return (
    <GraphQLEditor
      type="operation"
      className="operations-editor"
      introspectionData={introspectionData}
      initialDoc={operation}
      onChange={(value) => {
        updateRecordRequest({
          operation: value,
        });
      }}
    />
  );
};
