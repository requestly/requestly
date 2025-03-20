import lazyWithRetry from "utils/lazyWithRetry";

const EditorV2 = lazyWithRetry(
  () =>
    import(/* webpackChunkName: "EditorComponent" */ "./Editor").then((module) => {
      console.log("debug");
      return module;
    }),
  null
);

export default EditorV2;
