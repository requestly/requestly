import { Col } from "antd";
import { FcAndroidOs } from "react-icons/fc";
import APP_CONSTANTS from "config/constants";
export default function AndroidInterceptorLaunchHeader() {
  return (
    <Col xl={14} lg={12} className="hp-header-left-text hp-d-flex-center">
      <FcAndroidOs size={30} />
      <span className="hp-header-left-text-item hp-input-label hp-text-color-black-100 hp-text-color-dark-0 hp-ml-16 hp-mb-0">
        &nbsp; Powerful & Open-Source Requestly Android Debugger is live.&nbsp;
        <span
          onClick={(e) =>
            window.open(
              APP_CONSTANTS.LINKS.PRODUCT_HUNT.MOBILE_INTERCEPTOR,
              "_blank"
            )
          }
          className="hp-font-weight-300 hp-text-color-danger-3 cursor-pointer"
        >
          Get early access now!
        </span>
      </span>
    </Col>
  );
}
