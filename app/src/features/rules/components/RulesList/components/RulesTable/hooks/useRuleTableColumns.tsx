import { ContentTableProps } from "componentsV2/ContentTable/ContentTable";
import { RuleTableDataType } from "../types";
import { Button, Switch } from "antd";
import useRuleTableActions from "./useRuleTableActions";

const useRuleTableColumns = () => {
  const { handleStatusToggle } = useRuleTableActions();

  const columns: ContentTableProps<RuleTableDataType>["columns"] = [
    {
      title: "Rules",
      key: "name",
      render: (rule: RuleTableDataType) => rule.name,
      defaultSortOrder: "ascend",
      sorter: {
        // Fix. Descend logic sending groups to bottom
        // Fix: Default/No sort logic. Group should stay at top
        compare: (a, b) => {
          if (a.objectType === "group" && b.objectType !== "group") {
            return -1;
          } else if (a.objectType !== "group" && b.objectType === "group") {
            return 1;
          } else {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
          }
        },
      },
    },
    {
      title: "Status",
      key: "status",
      render: (rule: RuleTableDataType) => {
        const checked = rule?.status === "Active" ? true : false;

        return <Switch checked={checked} onChange={(checked: boolean) => handleStatusToggle([rule], checked)} />;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (rule: RuleTableDataType) => (
        <>
          <Button
            onClick={() => {
              console.log(rule);
            }}
          >
            Log
          </Button>
        </>
      ),
    },
  ];

  return columns;
};

export default useRuleTableColumns;
