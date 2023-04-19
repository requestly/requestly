import React from "react";
import { Alert, Button } from "reactstrap";
/**
 * The component is meant to be used inside the DashboardNavbar component
 *
 * The optional parameters currentPath and blackListPaths both should be provided when showing banner on selected routes
 * currentPath can be provided using `props.location.pathname` in DashboardNavbar
 * elements of blackListPaths can be taken from the PATHS constant in "../../../config/constants"
 *
 * @param {string} content Banner Info content
 * @param {function} ctaHandler Callback for CTA button click
 * @param {function} bannerIcon Icon to be displayed on starting of banner - OPTIONAL
 * @param {string} ctaText Text to be displayed on CTA button - OPTIONAL
 * @param {string} ctaIcon Icon on CTA button - OPTIONAL
 * @param {string} ctaIconPostion Position of icon in the button - "start" || "end" - OPTIONAL
 * @param {string} currentPath Path where banner is being displayed - OPTIONAL
 * @param {array[string]} blackListPaths Paths where banner should not be displayed - OPTIONAL
 * @param {boolean} dismissible Whether close banner icon should be there - OPTIONAL
 */
const TopBanner = ({
  content,
  ctaHandler,
  bannerIcon,
  ctaText,
  ctaIcon,
  ctaIconPostion,
  currentPath,
  blackListPaths,
  dismissible,
  isDismissed,
  onDismiss,
}) => {
  const renderBannerIcon = () => {
    if (!bannerIcon) return null;
    return <span className="mr-2">{React.createElement(bannerIcon)}</span>;
  };

  const renderCtaBtnIcon = () => {
    if (ctaIcon) return <span className="btn-inner--icon">{React.createElement(ctaIcon)} </span>;
    else return <React.Fragment></React.Fragment>;
  };

  return blackListPaths.includes(currentPath) ? null : (
    <nav className="navbar navbar-top navbar-expand navbar-dark bg-gradient-blue border-bottom-0">
      <div className="container-fluid">
        <div className="collapse navbar-collapse border-bottom-0 justify-content-center">
          <Alert
            color="primary"
            role="alert"
            className="p-2 mt-0 alert text-secondary alert-banner alert-primary shadow my-0"
            isOpen={dismissible ? !isDismissed : true}
            toggle={onDismiss}
            closeClassName={dismissible ? "banner-alert-close" : "hide-element"}
          >
            <span>
              {renderBannerIcon()}

              <span className="banner-text mr-2">{React.createElement(content)}</span>
              <Button
                color="default"
                className="btn btn-email btn-xs btn-white btn-icon"
                onClick={ctaHandler}
                size="sm"
              >
                {ctaIconPostion === "start" ? renderCtaBtnIcon() : null}
                <span className="btn-inner--text">{ctaText ? ctaText : "Click Here"}</span>
                {ctaIconPostion === "end" ? renderCtaBtnIcon() : null}
              </Button>
            </span>
          </Alert>
        </div>
      </div>
    </nav>
  );
};

export default TopBanner;
