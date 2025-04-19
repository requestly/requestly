import { Layout } from "antd";
import HeaderUser from "layouts/DashboardLayout/MenuHeader/HeaderUser";
import { redirectToRoot } from "utils/RedirectionUtils";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "components/sections/Footer";
import "./index.scss";

const MinimalLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="minimal-layout">
      <Layout.Header className="minimal-layout-navbar">
        <img
          className="logo"
          src={"/assets/media/common/rq_logo_full.svg"}
          alt="requestly logo"
          onClick={() => redirectToRoot(navigate)}
        />
        <HeaderUser />
      </Layout.Header>

      <div className="minimal-layout-main">
        <Outlet />
      </div>
      <div className="minimal-layout-footer">
        <Footer />
      </div>
    </div>
  );
};

export default MinimalLayout;
