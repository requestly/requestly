import React from "react";
import { Layout } from "antd";
import HeaderUser from "layouts/DashboardLayout/MenuHeader/HeaderUser";
import { redirectToRoot } from "utils/RedirectionUtils";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "components/sections/Footer";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import "./index.scss";

interface MinimalLayoutProps {
  children?: React.ReactNode;
}

const MinimalLayout: React.FC<MinimalLayoutProps> = ({ children = null }) => {
  const navigate = useNavigate();
  const isBrowserstackIntegrationEnabled = useFeatureIsOn("browserstack_integration");

  return (
    <div className="minimal-layout">
      <Layout.Header className="minimal-layout-navbar">
        {isBrowserstackIntegrationEnabled ? (
          <img
            width={94}
            height={32}
            className="logo"
            src="/assets/media/common/RQ-BStack Logo.svg"
            alt="Requestly by Browserstack"
            onClick={() => redirectToRoot(navigate)}
          />
        ) : (
          <img
            width={94}
            height={32}
            className="logo"
            src={"/assets/media/common/rq_logo_full.svg"}
            alt="Requestly"
            onClick={() => redirectToRoot(navigate)}
          />
        )}

        <HeaderUser />
      </Layout.Header>

      <div className="minimal-layout-main">{children ?? <Outlet />}</div>
      <div className="minimal-layout-footer">
        <Footer />
      </div>
    </div>
  );
};

export default MinimalLayout;
