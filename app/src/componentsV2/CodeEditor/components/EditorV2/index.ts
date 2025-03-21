import lazyWithRetry from "utils/lazyWithRetry";

const EditorV2 = lazyWithRetry(
  () =>
    import(/* webpackChunkName: "EditorComponent" */ "./Editor").then((module) => {
      return module;
    }),
  null
);

export default EditorV2;
