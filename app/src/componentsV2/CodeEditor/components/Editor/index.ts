import lazyWithRetry from "utils/lazyWithRetry";

const LazyEditor = lazyWithRetry(
  () =>
    import(/* webpackChunkName: "EditorComponent" */ "./Editor").then((module) => {
      console.log("debug");
      return module;
    }),
  null
);

export default LazyEditor;
