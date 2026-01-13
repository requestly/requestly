import React, { useEffect, useRef } from "react";
import Explorer from "graphiql-explorer";
import { buildClientSchema, parse } from "graphql";
import "@graphiql/plugin-explorer/style.css";
import { Checkbox } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { IoMdRefresh } from "@react-icons/all-files/io/IoMdRefresh";
import { useGraphQLIntrospection } from "features/apiClient/hooks/useGraphQLIntrospection";
import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { BufferedGraphQLRecordEntity } from "features/apiClient/slices/entities";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import "./schemaBuilder.scss";

interface Props {
  entity: BufferedGraphQLRecordEntity;
  setIsSchemaBuilderOpen: (isOpen: boolean) => void;
}

export const SchemaBuilder: React.FC<Props> = ({ entity, setIsSchemaBuilderOpen }) => {
  const operation = useApiClientSelector((s) => entity.getOperation(s) || "");
  const url = useApiClientSelector((s) => entity.getUrl(s) || "");
  const [introspectionData, hasIntrospectionFailed] = useGraphQLRecordStore((state) => [
    state.introspectionData,
    state.hasIntrospectionFailed,
  ]);
  const { introspectAndSaveSchema } = useGraphQLIntrospection({
    recordId: entity.meta.referenceId,
    url,
  });

  const hasParsedSuccessfully = useRef(false);

  /*
   * This effect is added due to Explorer component's internal query caching logic.
   * The graphiql-explorer package uses module-level memoization that caches parsed queries
   * across all component instances. When multiple SchemaBuilder components are rendered
   * (e.g., in different tabs), they share the same parsed query cache, causing field
   * selection state to be shared between instances.
   *
   * Additionally, when a query fails to parse, the Explorer component may fall back to
   * using a previously cached query, which can lead to unexpected behavior and further
   * state sharing issues between different instances.
   *
   * By only passing the query to Explorer after it has been successfully parsed once,
   * we prevent the Explorer from caching invalid queries and reduce the likelihood of
   * shared state issues between different instances.
   */
  useEffect(() => {
    if (!hasParsedSuccessfully.current) {
      try {
        parse(operation);
        hasParsedSuccessfully.current = true;
      } catch (e) {
        // NO OP
      }
    }
  }, [operation]);

  const handleEdit = (query: string) => {
    entity.setOperation(query);
  };

  return (
    <>
      <div className="schema-builder">
        <div className="schema-builder__header-container">
          <div className="schema-builder__header-container__title">SCHEMA</div>
          <div className="schema-builder__header-container__actions">
            <RQButton size="small" type="transparent" onClick={introspectAndSaveSchema} icon={<IoMdRefresh />} />
            <RQButton
              size="small"
              type="transparent"
              icon={<MdClose />}
              onClick={() => setIsSchemaBuilderOpen(false)}
            />
          </div>
        </div>
        {introspectionData ? (
          <div className="schema-builder__content">
            <Explorer
              schema={introspectionData ? buildClientSchema(introspectionData) : {}}
              query={hasParsedSuccessfully.current ? operation : ""}
              explorerIsOpen={true}
              arrowClosed={<Checkbox checked={false} className="schema-builder__checkbox" />}
              arrowOpen={<Checkbox checked={true} className="schema-builder__checkbox" />}
              checkboxChecked={<Checkbox checked={true} className="schema-builder__checkbox" />}
              checkboxUnchecked={<Checkbox checked={false} className="schema-builder__checkbox" />}
              onEdit={(query: string) => handleEdit(query)}
              colors={{
                keyword: "#E29C6D",
                property: "var(--requestly-color-text-default)",
                def: "var(--requestly-color-text-default)",
                attribute: "#FF8080",
              }}
              styles={{
                buttonStyle: {
                  background: "transparent",
                  borderRadius: "4px",
                },
              }}
            />
          </div>
        ) : hasIntrospectionFailed ? (
          <div className="schema-builder__error-view">
            <img src="/assets/media/apiClient/request-error.svg" alt="error window" />
            <div className="schema-builder__error-view__title">Error loading GraphQL schema</div>
            <div className="schema-builder__error-view__description">
              404 not found — the endpoint may be missing or misconfigured.
            </div>
            <RQButton size="small" onClick={introspectAndSaveSchema} icon={<IoMdRefresh />}>
              Fetch again
            </RQButton>
          </div>
        ) : (
          <div className="schema-builder__empty-state">
            <img src="/assets/media/rules/empty-inbox.svg" alt="empty drawer" />
            <div className="schema-builder__empty-state__title">Nothing to see here!</div>
            <div className="schema-builder__empty-state__description">Please enter a valid URL to load the schema.</div>
          </div>
        )}
      </div>
    </>
  );
};
