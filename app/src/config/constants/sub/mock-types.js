import { IoLogoHtml5 } from "@react-icons/all-files/io5/IoLogoHtml5";
import { IoLogoCss3 } from "@react-icons/all-files/io5/IoLogoCss3";
import { IoLogoJavascript } from "@react-icons/all-files/io5/IoLogoJavascript";

const MOCK_TYPES_CONFIG = {
  // API: {
  //   ID: 1,
  //   TYPE: "API",
  //   NAME: "Mock API",
  //   DESCRIPTION: "Mock an API Response",
  //   ICON: () => <ApiOutlined />,
  //   PRIMARY_COLOR: "#5b9027",
  //   SECONDARY_COLOR: "#4E7C22",
  //   TOOL_TIP_PLACEMENT: "top",
  // },
  HTML: {
    ID: 4,
    TYPE: "HTML",
    NAME: "Host new HTML file",
    DESCRIPTION: "Mock an HTML Response",
    ICON: () => <IoLogoHtml5 style={{ color: "#fff", fontSize: "1.2rem", marginTop: "4px" }} />,
    PRIMARY_COLOR: "#2aa5e7",
    SECONDARY_COLOR: "#199ADE",
    TOOL_TIP_PLACEMENT: "top",
  },
  CSS: {
    ID: 3,
    TYPE: "CSS",
    NAME: "Host new CSS file",
    DESCRIPTION: "Mock a CSS Response",
    ICON: () => <IoLogoCss3 style={{ color: "#fff", fontSize: "1.2rem", marginTop: "4px" }} />,
    PRIMARY_COLOR: "#d32a0e",
    SECONDARY_COLOR: "#BB250C",
    TOOL_TIP_PLACEMENT: "top",
  },
  Headers: {
    ID: 2,
    TYPE: "JS",
    NAME: "Host new JS file",
    DESCRIPTION: "Mock a JS Response",
    ICON: () => <IoLogoJavascript style={{ color: "#fff", fontSize: "1.2rem", marginTop: "4px" }} />,
    PRIMARY_COLOR: "#dd9d12",
    SECONDARY_COLOR: "#C58C10",
    TOOL_TIP_PLACEMENT: "top",
  },
};

export default MOCK_TYPES_CONFIG;
