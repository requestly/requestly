import lazyload from "utils/lazyload";

export default lazyload(
  () => import(/* webpackChunkName: "TeamWorkSolvePuzzleAnimation" */ "./TeamWorkSolvePuzzleAnimation"),
  null
);
