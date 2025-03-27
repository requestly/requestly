import lazyWithRetry from "utils/lazyWithRetry";
import { RQSingleLineEditorProps } from "./SingleLineEditor";
import React from "react";

const SingleLineEditor: React.FC<RQSingleLineEditorProps> = lazyWithRetry(
  () =>
    import(/* webpackChunkName: "SingleLineEditor"*/ "./SingleLineEditor").then((module) => {
      return { default: module.RQSingleLineEditor };
    }),
  null
);

export default SingleLineEditor;
