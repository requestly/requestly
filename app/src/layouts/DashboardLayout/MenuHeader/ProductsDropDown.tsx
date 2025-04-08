import React, { useCallback, useMemo, useState } from "react";
import { Button, Card, Dropdown, MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import {
  redirectToMocks,
  redirectToRules,
  redirectToSessionRecordingHome,
  redirectToUrl,
} from "utils/RedirectionUtils";

import {
  ApiOutlined as ApiClientImg,
  RadarChartOutlined as ApiAccessImg,
  DesktopOutlined as DesktopImg,
  CloudOutlined as MockServerImg,
  VideoCameraOutlined as SessionImg,
  SwapOutlined as RulesImg,
  DownOutlined,
} from "@ant-design/icons";

import "./ProductsDropDown.scss";
import PATHS from "config/constants/sub/paths";
import { DesktopAppPromoModal } from "./DesktopAppPromoModal";
import {
  trackProductClickedInDropDown,
  trackProductsDropDownBtnClicked,
  trackTopbarClicked,
} from "modules/analytics/events/common/onboarding/header";
import { RQBadge } from "lib/design-system/components/RQBadge";
import LINKS from "config/constants/sub/links";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

interface ProductProps {
  title: string | React.ReactNode;
  icon: React.ComponentType;
  description: string;
  handleClick: () => void;
}

const ProductTile: React.FC<ProductProps> = ({ title, icon: Icon, description, handleClick }) => {
  return (
    <Card hoverable onClick={handleClick} className="product-tile">
      <div className="product-content">
        <div className="product-icon">
          {React.createElement(Icon) ? (
            <span>{React.createElement(Icon)}</span>
          ) : (
            <span role="img" aria-label="api" className="anticon anticon-api">
              <Icon />
            </span>
          )}
        </div>
        <div className="product-details">
          <h3 className="product-title">{title}</h3>
          <p className="product-description">{description}</p>
        </div>
      </div>
    </Card>
  );
};

interface ProductsProps extends MenuProps {
  toggleDropDown: () => void;
}

const Products: React.FC<ProductsProps> = (props) => {
  const navigate = useNavigate();
  const isDesktopSessionsEnabled = useFeatureIsOn("desktop-sessions");

  const [isDesktopAppPromoModalOpen, setIsDesktopAppPromoModalOpen] = useState(false);
  const isRequestlyApiEnabled = useFeatureIsOn("requestly_api_in_header");

  const handleDesktopAppPromoClicked = useCallback(() => {
    setIsDesktopAppPromoModalOpen(true);
    trackTopbarClicked("desktop_app");
  }, []);

  const handleDesktopAppPromoModalClose = useCallback(() => {
    setIsDesktopAppPromoModalOpen(false);
  }, []);

  const products: ProductProps[] = useMemo(
    () => [
      {
        title: "HTTP Rules (Web Debugger)",
        icon: RulesImg,
        description: "Intercept and modify requests, inject scripts, Map Local, Map Remote, etc.",
        handleClick: () => {
          trackProductClickedInDropDown("web_debugger");
          props.toggleDropDown();
          redirectToRules(navigate);
        },
      },
      {
        title: "Mock Server",
        icon: MockServerImg,
        description: "Generate mock API endpoints for testing when the backend isn’t ready.",
        handleClick: () => {
          trackProductClickedInDropDown("mock_server");
          props.toggleDropDown();
          redirectToMocks(navigate);
        },
      },
      {
        title: <>SessionBook</>,
        icon: SessionImg,
        description: "Capture, report and debug with screen recording, network logs and console logs.",
        handleClick: () => {
          trackProductClickedInDropDown("session_replay");
          props.toggleDropDown();
          redirectToSessionRecordingHome(navigate, isDesktopSessionsEnabled);
        },
      },
      {
        title: (
          <>
            API Client <RQBadge badgeText="BETA" className="beta-badge" />
          </>
        ),
        icon: ApiClientImg,
        description: "A lightweight API Client to test APIs faster and share with teams.",
        handleClick: () => {
          trackProductClickedInDropDown("api_client");
          props.toggleDropDown();
          navigate(PATHS.API_CLIENT.INDEX);
        },
      },
      {
        title: "Desktop App",
        icon: DesktopImg,
        description: "Inspect and modify HTTP(s) traffic from any browser, terminal or app.            ",
        handleClick: () => {
          trackProductClickedInDropDown("desktop_app");
          handleDesktopAppPromoClicked();
          props.toggleDropDown();
        },
      },
      {
        title: "Requestly APIs",
        icon: ApiAccessImg,
        description: "Integrate Requestly into your CI/CD Pipelines using Requestly REST APIs.",
        handleClick: () => {
          trackProductClickedInDropDown("api_access");
          // todo: add typeform link
          redirectToUrl(LINKS.REQUESTLY_API_DOCS, true);
          props.toggleDropDown();
        },
      },
    ],
    [props, navigate, isDesktopSessionsEnabled, handleDesktopAppPromoClicked]
  );

  if (!isRequestlyApiEnabled) {
    products.splice(5, 1);
  }

  return (
    <div className="products-grid">
      {products.map((product, index) => (
        <ProductTile
          key={index}
          title={product.title}
          icon={product.icon}
          description={product.description}
          handleClick={product.handleClick}
        />
      ))}
      <DesktopAppPromoModal open={isDesktopAppPromoModalOpen} onCancel={handleDesktopAppPromoModalClose} />
    </div>
  );
};

const ProductsDropDown: React.FC<{}> = () => {
  const [open, setOpen] = useState(false);
  const toggleDropDown = useCallback(() => {
    setOpen(!open);
  }, [open]);
  const handleDropDownBtnClick = useCallback(() => {
    trackProductsDropDownBtnClicked();
    toggleDropDown();
  }, [toggleDropDown]);
  return (
    <>
      <Dropdown
        open={open}
        placement="bottomRight"
        trigger={["click"]}
        overlay={<Products toggleDropDown={handleDropDownBtnClick} />}
        onVisibleChange={toggleDropDown}
        className="no-drag"
      >
        <Button type="text" onClick={toggleDropDown}>
          Products <DownOutlined className="down-icon" />
        </Button>
      </Dropdown>
    </>
  );
};

export default ProductsDropDown;
