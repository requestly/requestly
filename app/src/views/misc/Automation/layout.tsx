import { useEffect, useTransition } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { Layout } from "antd";
import Footer from "components/sections/Footer";
import { redirectToRoot } from "utils/RedirectionUtils";
import { isEnvAutomation } from "utils/EnvUtils";
import removePreloader from "actions/UI/removePreloader";
import "./automation.css";

const AutomationTemplate = () => {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const isAutomation = isEnvAutomation();

  useEffect(() => {
    startTransition(() => {
      try {
        removePreloader();
      } catch (err) {
        console.error("Error removing preloader:", err);
      }
    });
  }, []);

  return (
    <div className={`automation-layout${isAutomation ? "" : " manual-mode"}`}>
      {!isAutomation && (
        <div className="page-error-message-banner">
          <span>
            <b>Note:</b> This page only works in automation environment. If you're accessing it manually, it won’t
            function as expected.
          </span>
        </div>
      )}

      <Layout.Header className="automation-layout-navbar">
        <img
          width={94}
          height={32}
          className="logo"
          src="/assets/media/common/RQ-BStack Logo.svg"
          alt="Requestly Logo"
          onClick={() => redirectToRoot(navigate)}
        />
      </Layout.Header>

      <div className="automation-layout-main">
        <Outlet />
      </div>

      <div className="automation-layout-footer">
        <Footer />
      </div>
    </div>
  );
};

export default AutomationTemplate;
