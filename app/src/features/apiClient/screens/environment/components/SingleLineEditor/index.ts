import lazyWithRetry from "utils/lazyWithRetry";

const LazySingleLineEditor = lazyWithRetry(
  () =>
    import(/* webpackChunkName: "SingleLineEditor"*/ "./SingleLineEditor").then((module) => {
      return { default: module.RQSingleLineEditor };
    }),
  null
);

export default LazySingleLineEditor;
