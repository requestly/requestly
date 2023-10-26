import React, { useEffect, useState } from "react";
// @ts-ignore
import rules from "./rules.json";
import ContentTable from "componentsV2/ContentTable/ContentTable";
import { rulesListToContentTableAdapter } from "features/rules/utils/rulesList";
import useRuleTableColumns from "./hooks/useRuleTableColumns";
import { RuleTableDataType } from "./types";

const actualRulesData = rules as RuleTableDataType[];

interface Props {}

const RulesTable: React.FC<Props> = ({}) => {
  const [rulesData, setRulesData] = useState([]);
  const columns = useRuleTableColumns();

  useEffect(() => {
    const finalRulesData = rulesListToContentTableAdapter(actualRulesData);
    setRulesData(finalRulesData);
  }, [actualRulesData]);

  // Fetch Rules Here
  console.log(rules);

  return (
    <>
      <ContentTable
        columns={columns}
        data={rulesData}
        bulkActionBarConfig={{
          type: "default",
          options: {
            infoText: (selectedRules) => `${selectedRules.length} Rules Selected`,
            actions: [
              {
                text: "Activate",
                onClick: (selectedRows: any) => {
                  console.log("Activate Bulk Action", { selectedRows });
                },
              },
            ],
          },
        }}
        filterHeaderConfig={{
          search: true,
          quickFilters: ["status"],
          filters: [
            {
              key: "search",
              label: "Search",
              onFilter: (value: string, data: any) => data?.name.toLowerCase().includes(value),
            },
            {
              key: "status",
              label: "Active",
              onFilter: (value: string, data: any) => data?.status === value,
            },
          ],
        }}
      />
    </>
  );
};

export default RulesTable;
