import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, Tooltip } from "reactstrap";
import { BsCardChecklist } from "react-icons/bs";
import { redirectToOnboardingPage } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
//UTILS
import { getUserAuthDetails } from "../../../../../../store/selectors";
import DataStoreUtils from "../../../../../../utils/DataStoreUtils";
import { getDateAfterAddingSomeDaysInUserSignupDate } from "../../../../../../utils/DateTimeUtils";
// CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

const UserOnboarding = () => {
  const mountedRef = useRef(true);
  const navigate = useNavigate();

  //Global State
  const user = useSelector(getUserAuthDetails);

  //Component State
  const [showOnboardingInSidebar, setShowOnboardingInSidebar] = useState(false);
  //showing tooltip on the very first visit to rules page only
  const [showOnboardingTooltip, setShowOnboardingTooltip] = useState(false);

  //To fetch all sign up date from firebase
  useEffect(() => {
    //  Fetch user attributes
    if (user && user.details.profile && user.details) {
      DataStoreUtils.getValue(["customProfile", user.details.profile.uid]).then(
        (attributesRef) => {
          if (attributesRef) {
            setShowOnboardingInSidebar(
              getDateAfterAddingSomeDaysInUserSignupDate(
                attributesRef.signup.signup_date,
                GLOBAL_CONSTANTS.ONBOARDING_DAYS_TO_EXPIRE
              )
            );
            if (!attributesRef.attributes.hasInitiallyVisited) {
              if (window.location.pathname === "/rules") {
                setShowOnboardingTooltip(true);
                DataStoreUtils.setValue(
                  [
                    "customProfile",
                    user.details.profile.uid,
                    "attributes",
                    "hasInitiallyVisited",
                  ],
                  true
                );
              }
            } else setShowOnboardingTooltip(false);
          }
          if (!mountedRef.current) return null;
        }
      );
      // Cleanup
      return () => {
        mountedRef.current = false;
      };
    } // eslint-disable-next-line
  }, [user, window.location.pathname]);

  return (
    <>
      {showOnboardingInSidebar ? (
        <>
          <Tooltip
            placement="bottom"
            isOpen={showOnboardingTooltip}
            target="tooltip"
          >
            Click here to get started.
          </Tooltip>
          <Button
            id="tooltip"
            className="btn-icon bg-transparent btn-3 has-no-box-shadow"
            color="primary"
            size="sm"
            type="button"
            onClick={() => {
              return redirectToOnboardingPage(navigate);
            }}
          >
            <span className="btn-inner--icon">
              <BsCardChecklist className="fix-icon-is-down" />
            </span>

            <span className="ml-2 mr-4 text-sm font-weight-bold">
              Getting Started
            </span>
          </Button>
        </>
      ) : null}
    </>
  );
};

export default UserOnboarding;
