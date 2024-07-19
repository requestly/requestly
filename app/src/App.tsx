import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routesV2 } from "routes";

/** Common things which do not depend on routes for App **/
const App = () => {
  const router = createBrowserRouter(routesV2);

  return <RouterProvider router={router} />;
};

export default App;
