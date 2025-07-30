import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { GraphQLEditor } from "../../GraphQLEditor";
import GQ_SCHEMA from "./GQ_SCHEMA.json";

export const OperationEditor = () => {
  const [operation, updateRecordRequest] = useGraphQLRecordStore((state) => [
    state.record.data.request.operation,
    state.updateRecordRequest,
  ]);
  return (
    <GraphQLEditor
      type="operation"
      className="operations-editor"
      // @ts-ignore
      schema={GQ_SCHEMA}
      initialDoc={operation}
      onChange={(value) => {
        updateRecordRequest({
          operation: value,
        });
      }}
    />
  );
};
