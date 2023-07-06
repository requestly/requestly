import lazyload from "utils/lazyload";

export default lazyload(() => import(/* webpackChunkName: "CreateWorkspace" */ "./CreateWorkspace"));
