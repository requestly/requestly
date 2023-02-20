import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Avatar, Col, Divider, Row, Tooltip } from "antd";
import { RiSettings3Line } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import fallbackAvatar from "assets/images/memoji/memoji-1.png";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { collection, doc, getDoc, getFirestore } from "firebase/firestore";
import {
  isPlanExpired as checkIfPlanIsExpired,
  isTrialPlan,
} from "utils/PremiumUtils";
import APP_CONSTANTS from "config/constants";
import { redirectToPricingPlans } from "utils/RedirectionUtils";
import { parseGravatarImage } from "utils/Misc";
import { IoRocketSharp } from "react-icons/io5";

const MenuFooter = (props) => {
  const { collapsed, onClose } = props;
  const navigate = useNavigate();

  // Global State
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const userName =
    user.loggedIn && user?.details?.profile?.displayName
      ? user.details.profile.displayName
      : "User";
  const userPhoto =
    user.loggedIn && user?.details?.profile?.photoURL
      ? parseGravatarImage(user.details.profile.photoURL)
      : null;

  // Component State
  const [isPlanExpired, setIsPlanExpired] = useState(false);
  const [isPlanActive, setIsPlanActive] = useState(false);
  const [isPlanTrial, setIsPlanTrial] = useState(false);
  // ToDo @sagar - show org count
  // eslint-disable-next-line no-unused-vars
  const [organizationUserCount, setOrganizationUserCount] = useState(0);

  const getOrganizationUserCount = async (user) => {
    try {
      if (!user.loggedIn) return () => {};
      const userOrganization = user?.details?.profile?.email?.split("@")[1];
      const firestore = getFirestore();
      const organizationRef = doc(
        collection(firestore, `companies`),
        userOrganization
      );
      const doesOrganizationExist = (await getDoc(organizationRef)).exists();

      if (!doesOrganizationExist) return () => {};
      const organizationData = (await getDoc(organizationRef)).data();

      if (!organizationData.showToMembers) return () => {};
      setOrganizationUserCount(organizationData.totalUsersCount);
    } catch (error) {
      return () => {};
    }
  };

  const renderPlanExpiredText = () => {
    return (
      <>
        <Row align="middle" style={{ marginTop: "auto", marginBottom: "1rem" }}>
          <Divider />

          <Row align="middle" justify="space-around" style={{ width: "100%" }}>
            <Col>
              <Row align="middle">
                <Avatar
                  size={36}
                  src={userPhoto ? userPhoto : fallbackAvatar}
                  className="menu-footer-avatar"
                />

                <div className="menu-user-info">
                  <span className="max-chars-130">{userName}</span>

                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(APP_CONSTANTS.PATHS.PRICING.ABSOLUTE);
                      return false;
                    }}
                    style={{ color: "red" }}
                  >
                    Premium Expired
                  </Link>
                </div>
              </Row>
            </Col>

            <Col>
              <Link to="#" onClick={onClose}>
                <RiSettings3Line
                  className="remix-icon hp-text-color-black-100 hp-text-color-dark-0"
                  size={24}
                />
              </Link>
            </Col>
          </Row>
        </Row>
      </>
    );
  };

  const renderPremiumPlanText = () => {
    return (
      <>
        <Row align="middle" style={{ marginTop: "auto", marginBottom: "1rem" }}>
          <Divider />

          <Row align="middle" justify="space-around" style={{ width: "100%" }}>
            <Col>
              <Row align="middle">
                <Avatar
                  size={36}
                  src={userPhoto ? userPhoto : fallbackAvatar}
                  className="menu-footer-avatar"
                />

                <div className="menu-user-info">
                  <span className="max-chars-130">{userName}</span>

                  <Link
                    to="#"
                    className="hp-badge-text hp-text-color-dark-30"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(APP_CONSTANTS.PATHS.ACCOUNT.ABSOLUTE);
                      return false;
                    }}
                    style={{ color: "green" }}
                  >
                    {isPlanTrial ? "Free Forever" : "Premium User"}
                  </Link>
                </div>
              </Row>
            </Col>

            <Col>
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(APP_CONSTANTS.PATHS.ACCOUNT.ABSOLUTE);
                  return false;
                }}
              >
                <RiSettings3Line
                  className="remix-icon hp-text-color-black-100 hp-text-color-dark-0"
                  size={24}
                />
              </Link>
            </Col>
          </Row>
        </Row>
      </>
    );
  };

  const renderUpgradePlanText = (user, appMode) => {
    return (
      <>
        {user.loggedIn ? (
          <>
            <Row
              align="middle"
              style={{ marginTop: "auto", marginBottom: "1rem" }}
            >
              <Divider />

              <Row
                align="middle"
                justify="space-around"
                style={{ width: "100%" }}
              >
                <Col>
                  <Row align="middle">
                    <Avatar
                      size={36}
                      src={userPhoto ? userPhoto : fallbackAvatar}
                      className="menu-footer-avatar"
                    />

                    <div className="menu-user-info">
                      <span className="max-chars-130">{userName}</span>

                      <Link
                        to="#"
                        className="inline-block light-pink-color"
                        onClick={(e) => {
                          e.preventDefault();
                          redirectToPricingPlans(navigate);
                          return false;
                        }}
                      >
                        Upgrade to Enterprise
                      </Link>
                    </div>
                  </Row>
                </Col>
                {
                  <Col>
                    <Link
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(APP_CONSTANTS.PATHS.PRICING.ABSOLUTE);
                        return false;
                      }}
                    >
                      <Tooltip title="Unlock More Features">
                        <IoRocketSharp
                          size={24}
                          className="remix-icon mr-9"
                          color="LightPink"
                        />
                      </Tooltip>
                    </Link>
                  </Col>
                }
              </Row>
            </Row>
          </>
        ) : (
          renderAnonymousText()
        )}
      </>
    );
  };

  const renderAnonymousText = () => {
    return null;
  };

  useEffect(() => {
    getOrganizationUserCount(user);
  }, [user]);

  useEffect(() => {
    if (user.details && user.details.isLoggedIn) {
      if (!user.details.planDetails) {
        setIsPlanActive(false);
        setIsPlanExpired(false);
        setIsPlanTrial(false);
      } else {
        setIsPlanExpired(checkIfPlanIsExpired(user.details.planDetails));
        setIsPlanActive(user.details.isPremium);
        setIsPlanTrial(isTrialPlan(user.details.planDetails?.type));
      }
    } else {
      setIsPlanActive(false);
      setIsPlanExpired(false);
      setIsPlanTrial(false);
    }
  }, [user]);

  if (collapsed) {
    if (!userPhoto) return null;
    return (
      <Row align="middle" justify="center" className="menu-footer">
        <Col>
          <Link to="#" onClick={onClose}>
            <Avatar size={36} src={userPhoto ? userPhoto : fallbackAvatar} />
          </Link>
        </Col>
      </Row>
    );
  }

  return isPlanActive
    ? isPlanExpired
      ? renderPlanExpiredText()
      : renderPremiumPlanText()
    : renderUpgradePlanText(user, appMode);
};

export default MenuFooter;
