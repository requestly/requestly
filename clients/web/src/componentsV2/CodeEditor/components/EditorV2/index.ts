import lazyWithRetry from "utils/lazyWithRetry";

const Editor = lazyWithRetry(
  () =>
    import(/* webpackChunkName: "EditorComponent" */ "./Editor").then((module) => {
      return module;
    }),
  null
);

export default Editor;
