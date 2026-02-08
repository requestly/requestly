import { GraphQLEditor } from "../../GraphQLEditor";
import { useDebounce } from "hooks/useDebounce";
import React, { useState, useCallback } from "react";
import { parse } from "graphql";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { BufferedGraphQLRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import "./operationsEditor.css";

interface Props {
  entity: BufferedGraphQLRecordEntity;
  introspectionData?: any;
}

export const OperationEditor: React.FC<Props> = ({ entity, introspectionData }) => {
  const operation = useApiClientSelector((s) => entity.getOperation(s) || "");

  const [isUsingSubscriptionOperation, setIsUsingSubscriptionOperation] = useState(false);
  const [isWarningVisible, setIsWarningVisible] = useState(false);

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

  const handleChange = useCallback(
    (value: string) => {
      entity.setOperation(value);
      debouncedCheckForSubscriptionOperation();
    },
    [entity, debouncedCheckForSubscriptionOperation]
  );

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
