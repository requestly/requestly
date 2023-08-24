import React from "react";
import { DetailsTab } from "@requestly-ui/resource-table";
import { ExecutionEvent } from "../../../types";
import ExecutionDetails from "./ExecutionDetails";

const executionDetailsTabs: DetailsTab<ExecutionEvent>[] = [
  {
    key: "details",
    label: "Details",
    render: (execution) => <ExecutionDetails execution={execution} />,
  },
];

export default executionDetailsTabs;
