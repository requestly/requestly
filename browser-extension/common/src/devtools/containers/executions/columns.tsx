import { Column } from "@requestly-ui/resource-table";
import { ExecutionEvent } from "../../types";

export enum EXECUTION_TABLE_COLUMN_IDS {
  URL = "url",
  METHOD = "method",
  TYPE = "type",
  RULE = "rule",
}

const executionTableColumns: Column<ExecutionEvent>[] = [
  {
    key: EXECUTION_TABLE_COLUMN_IDS.URL,
    header: "URL",
    render: (execution) => execution.requestURL,
  },
  {
    key: EXECUTION_TABLE_COLUMN_IDS.METHOD,
    header: "Method",
    width: 6,
    render: (execution) => execution.requestMethod,
  },
  {
    key: EXECUTION_TABLE_COLUMN_IDS.TYPE,
    header: "Type",
    width: 10,
    render: (execution) => execution._resourceType,
  },
  {
    key: EXECUTION_TABLE_COLUMN_IDS.RULE,
    header: "Rule",
    width: 30,
    render: (execution) => execution.rule.name,
  },
];

export default executionTableColumns;
