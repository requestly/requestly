import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { sessionBearRoutes } from "./routes";

/** Common things which do not depend on routes for App **/
const App = () => {
  const router = createBrowserRouter(sessionBearRoutes);

  return <RouterProvider router={router} />;
};

export default App;
