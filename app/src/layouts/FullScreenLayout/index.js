import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { fullScreenRoutes } from "routes/fullScreenRoutes";

const fullScreenRouter = createBrowserRouter(fullScreenRoutes);

const FullScreenLayout = () => {
  return <RouterProvider router={fullScreenRouter} />;
};

export default FullScreenLayout;
