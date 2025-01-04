import PATHS from "config/constants/sub/paths";
import GraphifyFeatureContainer from "./container";
import GraphifyHome from "./screens/graphify/home/components/graphifyHome";
import CreateTranslation from "./screens/graphify/translation/components/createTranslation";

export const graphifyRoutes = [
  {
    path: PATHS.GRAPHIFY.RELATIVE,
    element: <GraphifyFeatureContainer />,
    handle: {
      breadcrumb: {
        label: "Graphify",
      },
    },
    children: [
      {
        index: true,
        element: <GraphifyHome />,
      },
      {
        path: PATHS.GRAPHIFY.CREATE.INDEX,
        element: <CreateTranslation />,
      },
    ],
  },
];
