import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { GraphQLEditor } from "../../GraphQLEditor";
import { useDebounce } from "hooks/useDebounce";
import { extractOperationNames } from "../../../../utils";
import { useState } from "react";
import { parse } from "graphql";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import "./operationsEditor.css";

export const OperationEditor = () => {
  const [operation, introspectionData, updateEntryRequest, updateOperationNames] = useGraphQLRecordStore((state) => [
    state.entry.request.operation,
    state.introspectionData,
    state.updateEntryRequest,
    state.updateOperationNames,
  ]);

  const [isUsingSubscriptionOperation, setIsUsingSubscriptionOperation] = useState(false);
  const [isWarningVisible, setIsWarningVisible] = useState(false);

  const debouncedUpdateOperationNames = useDebounce((operationNames: string[]) => {
    updateOperationNames(operationNames);
  }, 500);

  const debouncedCheckForSubscriptionOperation = useDebounce(() => {
    if (!operation || typeof operation !== "string") {
      setIsUsingSubscriptionOperation(false);
      return;
    }

    try {
      const document = parse(operation);

      const isSubscriptionUsed = document.definitions.some((definition) => {
        if (definition.kind === "OperationDefinition") {
          return definition.operation === "subscription";
        }
        return false;
      });
      setIsUsingSubscriptionOperation(isSubscriptionUsed);
      setIsWarningVisible(isSubscriptionUsed);
    } catch (error) {
      setIsUsingSubscriptionOperation(false);
      setIsWarningVisible(false);
    }
  }, 500);

  const handleChange = (value: string) => {
    updateEntryRequest({
      operation: value,
    });

    const operationNames = extractOperationNames(value);
    if (operationNames.length > 0) {
      debouncedUpdateOperationNames(operationNames);
    }
    debouncedCheckForSubscriptionOperation();
  };

  return (
    <>
      {isUsingSubscriptionOperation && isWarningVisible && (
        <div className="subscription-operation-warning">
          Subscription operations are not supported in the API Client
          <span className="subscription-operation-warning__icon">
            <MdClose onClick={() => setIsWarningVisible(false)} />
          </span>
        </div>
      )}
      <GraphQLEditor
        type="operation"
        className={`operations-editor ${
          isUsingSubscriptionOperation && isWarningVisible ? "operations-editor-with-warning" : ""
        }`}
        introspectionData={introspectionData}
        initialDoc={operation}
        onChange={handleChange}
      />
    </>
  );
};
