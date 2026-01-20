import lazyWithRetry from "utils/lazyWithRetry";

export default lazyWithRetry(
  () => import(/* webpackChunkName: "InviteAcceptAnimation" */ "./InviteAcceptAnimation"),
  null
);

// export { default } from "./InviteAcceptAnimation";
