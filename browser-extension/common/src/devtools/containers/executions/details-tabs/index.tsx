import React from "react";
import { DetailsTab } from "../../../components/ResourceTable";
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
