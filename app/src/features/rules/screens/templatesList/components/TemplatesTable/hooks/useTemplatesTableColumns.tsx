import { Button, Table } from "antd";
import RuleTypeTag from "components/common/RuleTypeTag";
import { ContentListTableProps } from "componentsV2/ContentList";
import { TemplateRecord } from "../types";

interface Props {
  handlePreviewTemplate: (template: TemplateRecord) => void;
}

const useTemplatesTableColumns: (props: Props) => ContentListTableProps<TemplateRecord>["columns"] = ({
  handlePreviewTemplate,
}) => {
  const columns: ContentListTableProps<TemplateRecord>["columns"] = [
    Table.SELECTION_COLUMN,
    {
      title: "Name",
      key: "name",
      width: 320,
      render: (_: any, record: TemplateRecord) => {
        let ruleTypes: string[] = [];

        if (record.tags?.length) {
          ruleTypes = record.tags;
        } else if (!record.isSharedList) {
          ruleTypes = [record.data.ruleDefinition.ruleType];
        }
        return (
          <>
            <div className="template-name" onClick={() => handlePreviewTemplate(record)}>
              {record.name}
            </div>
            <div className="template-rule-tags">
              {ruleTypes.map((ruleType, index) => (
                <RuleTypeTag ruleType={ruleType} title={ruleType.toUpperCase()} />
              ))}
            </div>
          </>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 420,
      render: (description: string) => <div className="template-description">{description}</div>,
    },
    {
      title: "",
      key: "action",
      width: 120,
      render: (_: any, record: TemplateRecord) => {
        return (
          <div className="templates-actions-container">
            <Button type="default" onClick={() => handlePreviewTemplate(record)}>
              View
            </Button>
          </div>
        );
      },
    },
  ];

  return columns;
};

export default useTemplatesTableColumns;
