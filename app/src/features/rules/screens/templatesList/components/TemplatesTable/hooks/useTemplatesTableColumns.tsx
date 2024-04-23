import { Button, Table } from "antd";
import { ContentListTableProps } from "componentsV2/ContentList";
import { TemplateRecord } from "../types";
import RuleTypeTag from "components/common/RuleTypeTag";

const useTemplatesTableColumns = () => {
  const columns: ContentListTableProps<TemplateRecord>["columns"] = [
    Table.SELECTION_COLUMN,
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 320,
      render: (name: string) => <div className="template-name">{name}</div>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 420,
      render: (description: string) => <div className="template-description">{description}</div>,
    },
    {
      title: "Rule type",
      key: "rule",
      width: 160,
      render: (_: any, record: TemplateRecord) => {
        let ruleTypes: string[] = [];

        if (record.tags?.length) {
          ruleTypes = record.tags;
        } else if (!record.isSharedList) {
          ruleTypes = [record.data.ruleDefinition.ruleType];
        }

        return (
          <>
            {ruleTypes.map((ruleType, index) => (
              <div key={index}>
                <RuleTypeTag ruleType={ruleType} title={ruleType.toUpperCase()} />
              </div>
            ))}
          </>
        );
      },
    },
    {
      title: "",
      key: "action",
      width: 120,
      render: (_: any, record: TemplateRecord) => {
        return (
          <div className="templates-actions-container">
            <Button type="default">Use this</Button>
          </div>
        );
      },
    },
  ];

  return columns;
};

export default useTemplatesTableColumns;
