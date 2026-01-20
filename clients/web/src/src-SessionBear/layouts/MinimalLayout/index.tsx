import { Layout } from "antd";
import HeaderUser from "layouts/DashboardLayout/MenuHeader/HeaderUser";
import "./index.scss";
import { redirectToRoot } from "utils/RedirectionUtils";
import { Outlet, useNavigate } from "react-router-dom";

const MinimalLayout = () => {
  const navigate = useNavigate();

  return (
    <>
      <Layout.Header className="minimal-layout-navbar">
        <img
          className="logo"
          src={"/assets/media/common/sessionBearLogoFull.svg"}
          alt="requestly logo"
          onClick={() => redirectToRoot(navigate)}
        />
        <HeaderUser />
      </Layout.Header>
      <Outlet />
    </>
  );
};

export default MinimalLayout;
