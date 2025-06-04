import lazyWithRetry from "utils/lazyWithRetry";
import { SingleLineEditorProps } from "./types";
import React from "react";

const SingleLineEditor: React.FC<SingleLineEditorProps> = lazyWithRetry(
  () =>
    import(/* webpackChunkName: "SingleLineEditor"*/ "./SingleLineEditor").then((module) => {
      return { default: module.RQSingleLineEditor };
    }),
  null
);

export default SingleLineEditor;
