import Explorer from "graphiql-explorer";
import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { buildClientSchema } from "graphql";
import { MdKeyboardArrowRight } from "@react-icons/all-files/md/MdKeyboardArrowRight";
import { MdKeyboardArrowDown } from "@react-icons/all-files/md/MdKeyboardArrowDown";
import "@graphiql/plugin-explorer/style.css";
import { Checkbox } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { IoMdRefresh } from "@react-icons/all-files/io/IoMdRefresh";
import "./schemaBuilder.scss";
import { useGraphQLIntrospection } from "features/apiClient/hooks/useGraphQLIntrospection";

export const SchemaBuilder = () => {
  const [introspectionData, query, updateRecordRequest] = useGraphQLRecordStore((state) => [
    state.introspectionData,
    state.record.data.request.operation,
    state.updateRecordRequest,
  ]);

  const { introspectAndSaveSchema } = useGraphQLIntrospection();

  const handleEdit = (query: string) => {
    updateRecordRequest({ operation: query });
  };

  return (
    <>
      {introspectionData ? (
        <div className="schema-builder">
          <div className="schema-builder__header-container">
            <div className="schema-builder__header-container__title">SCHEMA</div>
            <div className="schema-builder__header-container__actions">
              <RQButton size="small" type="transparent" onClick={introspectAndSaveSchema} icon={<IoMdRefresh />} />
            </div>
          </div>
          <div className="schema-builder__content">
            <Explorer
              schema={introspectionData ? buildClientSchema(introspectionData) : {}}
              query={query}
              explorerIsOpen={true}
              arrowClosed={<MdKeyboardArrowRight className="schema-builder__arrow" />}
              arrowOpen={<MdKeyboardArrowDown className="schema-builder__arrow" />}
              checkboxChecked={<Checkbox checked={true} className="schema-builder__checkbox" />}
              checkboxUnchecked={<Checkbox checked={false} className="schema-builder__checkbox" />}
              onEdit={(query: string) => handleEdit(query)}
              colors={{
                keyword: "#E29C6D",
                property: "var(--requestly-color-text-default)",
                def: "var(--requestly-color-text-default)",
                attribute: "#FF8080",
              }}
              hideActions
            />
          </div>
        </div>
      ) : (
        <div>No Schema Available</div>
      )}
    </>
  );
};
