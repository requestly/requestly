import lazyWithRetry from "utils/lazyWithRetry";

const LazyEditorV2 = lazyWithRetry(
  () =>
    import(/* webpackChunkName: "EditorComponent" */ "./Editor").then((module) => {
      console.log("debug");
      return module;
    }),
  null
);

export default LazyEditorV2;
