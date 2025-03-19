import { useSelector } from "react-redux";
import { Col, Row } from "antd";
import { Link } from "react-router-dom";
import { isPricingPage, isGoodbyePage } from "utils/PathUtils";
import { getAppMode } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import DesktopAppProxyInfo from "components/sections/Navbars/NavbarRightContent/DesktopAppProxyInfo";

export default function HeaderText() {
  // GLOBAL STATE
  const appMode = useSelector(getAppMode);

  const renderRequestlyFullLogo = () => {
    return (
      <Row align="middle" justify="start" className="w-full">
        <Col>
          <Link to="/">
            <img
              src={"/assets/media/common/rq_logo_full.svg"}
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
        <Col className="hidden-on-small-screen desktop-app-proxy-info-container no-drag">
          <DesktopAppProxyInfo />
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

  return null;
}
