import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { GraphQLEditor } from "../../GraphQLEditor";
import { useDebounce } from "hooks/useDebounce";
import { extractOperationNames } from "../../../../utils";

export const OperationEditor = () => {
  const [operation, introspectionData, updateRecordRequest, updateOperationNames] = useGraphQLRecordStore((state) => [
    state.record.data.request.operation,
    state.introspectionData,
    state.updateRecordRequest,
    state.updateOperationNames,
  ]);

  const debouncedUpdateOperationNames = useDebounce((operationNames: string[]) => {
    updateOperationNames(operationNames);
  }, 500);

  const handleChange = (value: string) => {
    updateRecordRequest({
      operation: value,
    });

    const operationNames = extractOperationNames(value);
    if (operationNames.length > 0) {
      debouncedUpdateOperationNames(operationNames);
    }
  };

  return (
    <GraphQLEditor
      type="operation"
      className="operations-editor"
      introspectionData={introspectionData}
      initialDoc={operation}
      onChange={handleChange}
    />
  );
};
