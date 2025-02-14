import React from "react";
import { useNavigate } from "react-router-dom";
import { redirectToRules } from "utils/RedirectionUtils";
import { Layout, Col, Row } from "antd";
import HeaderUser from "layouts/DashboardLayout/MenuHeader/HeaderUser";
import "./index.css";

interface HeaderProps {
  showUserHeader?: boolean;
  doRedirectOnLogoClick?: boolean;
}

export const FullPageHeader: React.FC<HeaderProps> = ({ showUserHeader = false, doRedirectOnLogoClick = false }) => {
  const navigate = useNavigate();
  return (
    <Layout.Header className="full-page-navbar">
      <Row className="w-full" justify="space-between" align="middle">
        <Col>
          <img
            className="logo"
            src={"/assets/media/common/rq_logo_full.svg"}
            alt="requestly logo"
            onClick={() => (doRedirectOnLogoClick ? redirectToRules(navigate) : {})}
          />
        </Col>
        {showUserHeader && <HeaderUser />}
      </Row>
    </Layout.Header>
  );
};
