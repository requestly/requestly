import Explorer from "graphiql-explorer";
import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { buildClientSchema, IntrospectionQuery } from "graphql";
import GQ_SCHEMA from "../GraphQLEditor/components/OperationEditor/GQ_SCHEMA.json";
import { MdKeyboardArrowRight } from "@react-icons/all-files/md/MdKeyboardArrowRight";
import { MdKeyboardArrowDown } from "@react-icons/all-files/md/MdKeyboardArrowDown";
import "@graphiql/plugin-explorer/style.css";
import { Checkbox } from "antd";
import "./schemaBuilder.scss";

export const SchemaBuilder = () => {
  const [schema, query, updateRecordRequest] = useGraphQLRecordStore((state) => [
    state.schema,
    state.record.data.request.operation,
    state.updateRecordRequest,
  ]);

  const handleEdit = (query: string) => {
    updateRecordRequest({ operation: query });
  };

  return (
    <div className="schema-builder">
      <div className="schema-builder__header">SCHEMA</div>
      <div className="schema-builder__content">
        <Explorer
          // TEMPORARY USAGE OF GQ_SCHEMA.json
          schema={buildClientSchema((GQ_SCHEMA.data as unknown) as IntrospectionQuery)}
          query={query}
          explorerIsOpen={true}
          arrowClosed={<MdKeyboardArrowRight className="schema-builder__arrow" />}
          arrowOpen={<MdKeyboardArrowDown className="schema-builder__arrow" />}
          checkboxChecked={<Checkbox checked={true} className="schema-builder__checkbox" />}
          checkboxUnchecked={<Checkbox checked={false} className="schema-builder__checkbox" />}
          onEdit={(query: string) => handleEdit(query)}
          colors={{
            keyword: "var(--requestly-color-text-default)",
            property: "var(--requestly-color-text-default)",
            def: "var(--requestly-color-text-default)",
            attribute: "var(--requestly-color-text-default)",
          }}
          hideActions
        />
      </div>
    </div>
  );
};
