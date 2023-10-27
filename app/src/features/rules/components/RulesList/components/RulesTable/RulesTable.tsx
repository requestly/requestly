import React, { useEffect, useState } from "react";
import ContentTable from "componentsV2/ContentTable/ContentTable";
import useRuleTableColumns from "./hooks/useRuleTableColumns";
import { rulesToContentTableDataAdapter } from "./utils";
import { RuleObj } from "features/rules/types/rules";
import { RuleTableDataType } from "./types";

interface Props {
  rules: RuleObj[];
}

const RulesTable: React.FC<Props> = ({ rules }) => {
  const columns = useRuleTableColumns();

  const [contentTableData, setContentTableAdaptedRules] = useState<RuleTableDataType[]>([]);

  useEffect(() => {
    const contentTableAdaptedRules = rulesToContentTableDataAdapter(rules);
    setContentTableAdaptedRules(contentTableAdaptedRules);
  }, [rules]);

  return (
    <>
      <ContentTable
        columns={columns}
        data={contentTableData}
        rowKey="id"
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
      />
    </>
  );
};

export default RulesTable;
