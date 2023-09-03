// @ts-ignore // can't find types for requestly-core
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

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
import React, { useCallback, useState } from "react";
import PATHS from "config/constants/sub/paths";
import { DesktopAppPromoModal } from "./DesktopAppPromoModal";
import {
  trackProductClickedInDropDown,
  trackProductsDropDownBtnClicked,
  trackTopbarClicked,
} from "modules/analytics/events/common/onboarding/header";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { RQBadge } from "lib/design-system/components/RQBadge";
import LINKS from "config/constants/sub/links";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";

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

  const appMode = useSelector(getAppMode);

  const [isDesktopAppPromoModalOpen, setIsDesktopAppPromoModalOpen] = useState(false);

  const handleDesktopAppPromoClicked = useCallback(() => {
    setIsDesktopAppPromoModalOpen(true);
    trackTopbarClicked("desktop_app");
  }, []);

  const handleDesktopAppPromoModalClose = useCallback(() => {
    setIsDesktopAppPromoModalOpen(false);
  }, []);

  const products: ProductProps[] = [
    {
      title: "Web Debugger",
      icon: RulesImg,
      description: "Lightweight web debugging proxy to modify HTTPs request & response.",
      handleClick: useCallback(() => {
        trackProductClickedInDropDown("web_debugger");
        props.toggleDropDown();
        redirectToRules(navigate);
      }, [navigate, props]),
    },
    {
      title: (
        <>
          Session Replay <RQBadge badgeText="NEW" />
        </>
      ),
      icon: SessionImg,
      description: "A Modern way to Capture, Report, Debug & fix bugs in web applications",
      handleClick: useCallback(() => {
        trackProductClickedInDropDown("session_replay");
        props.toggleDropDown();
        redirectToSessionRecordingHome(navigate);
      }, [navigate, props]),
    },
    {
      title: "API Client",
      icon: ApiClientImg,
      description: "Customise request headers, query parameters, and request body payloads.",
      handleClick: useCallback(() => {
        trackProductClickedInDropDown("api_client");
        props.toggleDropDown();
        navigate(PATHS.API_CLIENT.INDEX);
      }, [navigate, props]),
    },
    {
      title: "Mock Server",
      icon: MockServerImg,
      description: "Generate custom API responses without actually having a pre-built API or a backend server",
      handleClick: useCallback(() => {
        trackProductClickedInDropDown("mock_server");
        props.toggleDropDown();
        redirectToMocks(navigate);
      }, [navigate, props]),
    },
    {
      title: "Desktop App",
      icon: DesktopImg,
      description: "Inspect and modify HTTP(s) traffic from any browser, desktop app & mobile apps",
      handleClick: useCallback(() => {
        trackProductClickedInDropDown("desktop_app");
        handleDesktopAppPromoClicked();
        props.toggleDropDown();
      }, [props, handleDesktopAppPromoClicked]),
    },
    {
      title: "Api Access",
      icon: ApiAccessImg,
      description: "Easily test changes related to a PR without needing a staging environment",
      handleClick: useCallback(() => {
        trackProductClickedInDropDown("api_access");
        // todo: add typeform link
        redirectToUrl(LINKS.REQUESTLY_API_DOCS, true);
        props.toggleDropDown();
      }, [props]),
    },
  ];

  if (!isFeatureCompatible(FEATURES.API_ACCESS)) {
    products.splice(5, 1);
  }

  if (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP)
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
      >
        <Button type="text" onClick={toggleDropDown}>
          Products <DownOutlined className="down-icon" />
        </Button>
      </Dropdown>
    </>
  );
};

export default ProductsDropDown;
