import { Button, Modal } from "antd";
import { MdCheckCircleOutline } from "@react-icons/all-files/md/MdCheckCircleOutline";
import { MdWarningAmber } from "@react-icons/all-files/md/MdWarningAmber";
import { isExtensionInstalled } from "actions/ExtensionActions";
import LINKS from "config/constants/sub/links";
import "./extensionInstalledScreen.scss";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "components/misc/PageLoader";
import { initIntegrations } from "./minimalIntegrations";
import removePreloader from "actions/UI/removePreloader";
import getExtensionInstallLink from "./getExtensionInstallLink";
import PATHS from "config/constants/sub/paths";

/* TEMPORARY COMPONENT, SHOULD BE REMOVED AFTER NEXT EXTENSION RELEASE */
const ExtensionInstalledScreen = () => {
  useEffect(() => {
    removePreloader();
    initIntegrations();
  }, []);

  const navigate = useNavigate();

  const [isParamsCleaned, setIsParamsCleaned] = useState(false);
  const [isBstackUser, setIsBstackUser] = useState(false);

  useEffect(() => {
    if (!isParamsCleaned) {
      const pageURL = new URL(window.location.href);
      const params = new URLSearchParams(pageURL.search);
      if (params.has("isBstack")) {
        setIsBstackUser(true);
        params.delete("isBstack");
        const newSearch = params.toString();
        navigate({ search: newSearch ? `?${newSearch}` : "" }, { replace: true });
      }
      setIsParamsCleaned(true);
    }
  }, [isParamsCleaned, navigate]);

  const handleButtonClick = useCallback(() => {
    if (!isExtensionInstalled()) {
      window.open(getExtensionInstallLink(), "_self");
      return;
    }

    if (isBstackUser) {
      navigate(PATHS.AUTH.START.RELATIVE, { replace: true });
    } else {
      navigate(PATHS.HOME.ABSOLUTE, { replace: true });
    }
  }, [isBstackUser, navigate]);

  const extensionInstalledStatusHeader = isExtensionInstalled() ? (
    <>
      <MdCheckCircleOutline className="success" />
      The extension has been successfully installed!
    </>
  ) : (
    <>
      <MdWarningAmber className="warning" />
      Requestly extension is not installed
    </>
  );

  return (
    <Modal // to quickly have a "full screen"
      zIndex={2000} // to make sure it is on the top of all other modals thrown by the app
      open={true}
      footer={null}
      closable={false}
      className="extension-installed-status-modal"
      wrapClassName="extension-installed-status-modal-wrapper"
    >
      {isParamsCleaned ? (
        <>
          <div className="extension-installed-status-content">
            <img src="/assets/media/common/RQ-BStack Logo.svg" alt="Requestly by Browserstack" />
            <div className="extension-installed-status-content-body">
              <div className="extension-installed-status-content-body-header">{extensionInstalledStatusHeader}</div>
              <div className="extension-installed-status-content-body-description">
                {isExtensionInstalled()
                  ? "You're all set to intercept, record, and mock network traffic — let’s get started."
                  : "To get started, please install the extension and refresh this page."}
              </div>
              <Button
                type="primary"
                className="extension-installed-status-content-body-button"
                onClick={handleButtonClick}
              >
                {isExtensionInstalled() ? "Continue to app" : "Install extension"}
              </Button>
            </div>
          </div>
          <div className="extension-installed-status-content-footer">
            By continuing to use Requestly, you acknowledge that you have read and agree to our{" "}
            <a href={LINKS.REQUESTLY_TERMS_AND_CONDITIONS} target="_blank" rel="noreferrer">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href={LINKS.REQUESTLY_PRIVACY_POLICY} target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
          </div>
        </>
      ) : (
        <PageLoader />
      )}
    </Modal>
  );
};

export default ExtensionInstalledScreen;
