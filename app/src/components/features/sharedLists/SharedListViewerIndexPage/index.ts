import lazyload from "../../../../utils/lazyload";

export default lazyload(
  () => import(/* webpackChunkName: "SharedListViewerIndexPage" */ "./SharedListViewerIndexPage")
);

// export { default } from "./SharedListViewerIndexPage";
