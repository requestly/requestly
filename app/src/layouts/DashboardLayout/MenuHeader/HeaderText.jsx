import { useSelector } from "react-redux";
import { Col, Row } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  isPricingPage,
  isMobileInterceptorPage,
  isGoodbyePage,
} from "utils/PathUtils";
import RQ_LOGO from "assets/img/brand/rq.png";
import RQ_LOGO_LIGHT_BLUE from "assets/img/brand/rq-full-logo-light-blue.svg";
import { getAppMode, getAppTheme, getUserAuthDetails } from "store/selectors";
import APP_CONSTANTS from "../../../config/constants";
import DesktopAppProxyInfo from "components/sections/Navbars/NavbarRightContent/DesktopAppProxyInfo";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { FaStackOverflow } from "react-icons/fa";
import MobileDebuggerAppSelector from "components/features/mobileDebugger/components/AppSelector";
import THEMES from "config/constants/sub/themes";
import { YoutubeFilled } from "@ant-design/icons";
import { trackPromoHeaderClicked } from "modules/analytics/events/misc/promoHeader";
const { PATHS } = APP_CONSTANTS;

const SHOW_SESSION_RECORDING_BANNER = false;
const SHOW_STACK_OVERFLOW_BLOG_BANNER = false;
const SHOW_MONTHLY_UPDATE_BANNER = false;

export default function HeaderText() {
  const location = useLocation();
  const navigate = useNavigate();

  // GLOBAL STATE
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const appTheme = useSelector(getAppTheme);

  const renderSessionRecordingPromo = () => {
    return (
      <Col>
        <span className="hp-header-left-text-item hp-input-label hp-text-color-black-100 hp-text-color-dark-0 hp-ml-16 hp-mb-0">
          Auto-record Debugging Sessions with Console and Network Logs - &nbsp;
          <span
            className="hp-font-weight-300 hp-text-color-danger-3 cursor-pointer"
            onClick={(e) => {
              trackPromoHeaderClicked(
                "session_recording",
                PATHS.SESSIONS.ABSOLUTE
              );
              navigate(PATHS.SESSIONS.ABSOLUTE);
            }}
          >
            Try Now
          </span>{" "}
          or
          <span
            className="hp-font-weight-300 hp-text-color-danger-3 cursor-pointer"
            onClick={(e) => {
              const url = "https://bit.ly/3camopf";
              trackPromoHeaderClicked("session_recording", url);
              window.open(url, "_blank");
            }}
          >
            {" "}
            Watch Demo &nbsp;
            <YoutubeFilled style={{ color: "red", fontSize: 18 }} />
          </span>
        </span>
      </Col>
    );
  };

  const renderStackOverflowBlogPromo = () => {
    return (
      <Col xl={14} lg={12} style={{ maxWidth: "max-content" }}>
        <span>
          Find out how Developers and QAs use Requestly to solve their
          problems&nbsp;
          <span
            className="  hp-text-color-danger-3 cursor-pointer"
            onClick={(e) => {
              const url = "https://bit.ly/3NDygPd";
              trackPromoHeaderClicked("stack_overflow_blog_clicked", url);
              window.open(url, "_blank");
            }}
          >
            here&nbsp;
            <FaStackOverflow style={{ color: "orange", fontSize: 15 }} />
          </span>
        </span>
      </Col>
    );
  };

  const renderMonthlyUpdatePromo = () => {
    return (
      <Col>
        <span className="hp-header-left-text-item hp-input-label hp-text-color-black-100 hp-text-color-dark-0 hp-ml-16 hp-mb-0">
          What's new in Requestly! View our
          <span
            className="hp-font-weight-300 hp-text-color-danger-3 cursor-pointer"
            onClick={(e) => {
              const url =
                "https://www.linkedin.com/pulse/requestly-dec22-product-updates-requestly/?trackingId=9%2FgYHuWkqH8iAMwElhNW1A%3D%3D";
              trackPromoHeaderClicked("monthly_update_dec_22", url);
              window.open(url, "_blank");
            }}
          >
            {" "}
            December 2022 Update
          </span>
        </span>
      </Col>
    );
  };

  const renderRequestlyFullLogo = () => {
    return (
      <Row align="middle" justify="start" className="w-full">
        <Col>
          <Link to="/">
            <img
              src={appTheme === THEMES.LIGHT ? RQ_LOGO : RQ_LOGO_LIGHT_BLUE}
              style={{
                boxSizing: "border-box",
                display: "inline-block",
                maxHeight: "3em",
                verticalAlign: "middle",
                marginLeft: "-8px",
              }}
              alt="logo"
            />
          </Link>
        </Col>
      </Row>
    );
  };

  const renderProxyInfo = () => {
    return (
      <>
        <Col xl={14} lg={12}>
          <Link to="/">
            <DesktopAppProxyInfo />
          </Link>
        </Col>
      </>
    );
  };

  const renderMobileInterceptorAppSelector = () => {
    return (
      <>
        <Col span={4}>
          <MobileDebuggerAppSelector />
        </Col>
      </>
    );
  };

  if (isPricingPage() || isGoodbyePage()) {
    return renderRequestlyFullLogo();
  }

  if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
    return renderProxyInfo();
  }

  if (isMobileInterceptorPage(location.pathname) && user.details?.isLoggedIn) {
    return renderMobileInterceptorAppSelector();
  }

  if (SHOW_SESSION_RECORDING_BANNER) {
    return renderSessionRecordingPromo();
  }

  if (SHOW_MONTHLY_UPDATE_BANNER) {
    return renderMonthlyUpdatePromo();
  }

  if (SHOW_STACK_OVERFLOW_BLOG_BANNER) {
    return renderStackOverflowBlogPromo();
  }

  return null;
}
