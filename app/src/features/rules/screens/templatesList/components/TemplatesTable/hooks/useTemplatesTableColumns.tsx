import { Button, Table } from "antd";
import { ContentListTableProps } from "componentsV2/ContentList";
import { TemplateRecord } from "../types";

const useTemplatesTableColumns = () => {
  const columns: ContentListTableProps<TemplateRecord>["columns"] = [
    Table.SELECTION_COLUMN,
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => name,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string) => description,
    },
    {
      title: "Rule",
      dataIndex: "data.ruleDefinition.ruleType",
      key: "rule",
      render: (ruleType: string) => ruleType,
    },
    {
      title: "",
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (_: any, record: TemplateRecord) => {
        return (
          <Button type="default" size="small">
            Use this
          </Button>
        );
      },
    },
  ];

  return columns;
};

export default useTemplatesTableColumns;
