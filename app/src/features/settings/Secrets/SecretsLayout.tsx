import React from "react";
import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { RQButton } from "lib/design-system-v2/components";
import FilterIcon from "assets/icons/filter-manage.svg?react";
import ShieldLockIcon from "assets/icons/shield-lock.svg?react";
import { Outlet, useNavigate } from "react-router-dom"; // Added React Router imports
import "./secrets.scss";
import PATHS from "config/constants/sub/paths";

// Made children optional since React Router will mostly use <Outlet />
const SecretsLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();

  const handleManageProvidersClick = () => {
    navigate(PATHS.SETTINGS.SECRETS.MANAGE_PROVIDERS);
  };

  return (
    <main className="secrets-page-container">
      <section className="secrets-content-container">
        <div className="header-container">
          <div className="header-left-section">
            <ShieldLockIcon />
            <span className="secrets-text">Secrets</span>
          </div>
          <div className="header-right-section">
            <RQButton icon={<AiOutlineQuestionCircle />} type="transparent">
              Help
            </RQButton>
            <RQButton
              type="transparent"
              icon={<FilterIcon />}
              onClick={handleManageProvidersClick} // Replaced alert with navigation
            >
              Manage providers
            </RQButton>
            <RQButton type="secondary" onClick={() => alert("Add provider functionality coming soon!")}>
              Add provider
            </RQButton>
          </div>
        </div>
        {children || <Outlet />}
      </section>
    </main>
  );
};

export default SecretsLayout;
