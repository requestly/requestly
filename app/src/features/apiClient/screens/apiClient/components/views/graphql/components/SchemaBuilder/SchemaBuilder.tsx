import React from "react";
import Explorer from "graphiql-explorer";
import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { buildClientSchema } from "graphql";
import "@graphiql/plugin-explorer/style.css";
import { Checkbox } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { IoMdRefresh } from "@react-icons/all-files/io/IoMdRefresh";
import { useGraphQLIntrospection } from "features/apiClient/hooks/useGraphQLIntrospection";
import "./schemaBuilder.scss";
import { MdClose } from "@react-icons/all-files/md/MdClose";

interface Props {
  setIsSchemaBuilderOpen: (isOpen: boolean) => void;
}

export const SchemaBuilder: React.FC<Props> = ({ setIsSchemaBuilderOpen }) => {
  const [introspectionData, query, updateEntryRequest] = useGraphQLRecordStore((state) => [
    state.introspectionData,
    state.entry.request.operation,
    state.updateEntryRequest,
  ]);

  const { introspectAndSaveSchema } = useGraphQLIntrospection();

  const handleEdit = (query: string) => {
    updateEntryRequest({ operation: query });
  };

  return (
    <>
      {introspectionData ? (
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
          <div className="schema-builder__content">
            <Explorer
              schema={introspectionData ? buildClientSchema(introspectionData) : {}}
              query={query}
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
        </div>
      ) : (
        <div className="schema-builder__empty-state">
          <img src="/assets/media/rules/empty-inbox.svg" alt="empty drawer" />
          <div className="schema-builder__empty-state__title">Nothing to see here!</div>
          <div className="schema-builder__empty-state__description">Please enter a valid URL to load the schema.</div>
        </div>
      )}
    </>
  );
};
