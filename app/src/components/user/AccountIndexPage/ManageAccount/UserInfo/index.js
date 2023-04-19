import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Card, CardHeader, Col, CardBody, FormGroup, Form, Input } from "reactstrap";
import { Button, Typography } from "antd";
import Select from "react-select";
import { isEmpty } from "lodash";
import { toast } from "utils/Toast.js";
// UTILS
import DataStoreUtils from "../../../../../utils/DataStoreUtils";
import { getUserAuthDetails } from "../../../../../store/selectors";
import { getCountryNameFromISOCode } from "../../../../../utils/FormattingHelper";
// ACTIONS
import { updateUserProfile } from "./actions";
import { refreshUserInGlobalState } from "../../../common/actions";
// CONSTANTS
import APP_CONSTANTS from "../../../../../config/constants";
import { getUsername, updateUsername } from "backend/auth/username";
import { actions } from "store";
import { trackUsernameUpdated } from "modules/analytics/events/misc/username";

const UserInfo = ({ customHeading, shadow, hideBillingAddress }) => {
  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  //Component State
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [areChangesPending, setAreChangesPending] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [userFullName, setUserFullName] = useState("");
  const [userAddrLine1, setUserAddrLine1] = useState("");
  const [userAddrLine2, setUserAddrLine2] = useState("");
  const [userAddrCity, setUserAddrCity] = useState("");
  const [userAddrState, setUserAddrState] = useState("");
  const [userAddrCountry, setUserAddrCountry] = useState("");
  const [userAddrZIP, setUserAddrZIP] = useState("");

  useEffect(() => {
    // TODO: This should ideally come from redux
    getUsername(user?.details?.profile?.uid).then((username) => {
      setUsername(username);
    });
  }, [user?.details?.profile?.uid]);

  const handleOnUsernameChange = (username) => {
    setUsername(username);
  };

  const handleSaveProfileOnClick = () => {
    setSavingChanges(true);
    Promise.all([
      updateUserProfile(user.details.profile.uid, {
        FullName: userFullName,
        Address: {
          AddrLine1: userAddrLine1,
          AddrLine2: userAddrLine2,
          AddrCity: userAddrCity,
          AddrState: userAddrState,
          AddrCountry: userAddrCountry,
          AddrZIP: userAddrZIP,
        },
      }).then(() => {
        // Refresh user in global state
        refreshUserInGlobalState(dispatch);
      }),
      updateUsername(user?.details?.profile?.uid, username)
        .then(() => {
          trackUsernameUpdated(username, user?.details?.username);
          setUsernameError("");
          dispatch(
            actions.updateUsername({
              username: username,
            })
          );
        })
        .catch((err) => {
          setUsernameError(err.message);
          throw err;
        }),
    ])
      .then(() => {
        setAreChangesPending(false);
        setSavingChanges(false);
        toast.info("Profile saved");
      })
      .catch(() => {
        setAreChangesPending(false);
        setSavingChanges(false);
        toast.error("Error Saving Profile");
      });
  };

  const renderSaveButton = () => {
    return (
      <Row className="align-items-center">
        <Col className="text-center" xs="12">
          <Button
            disabled={!areChangesPending}
            onClick={handleSaveProfileOnClick}
            type={"primary"}
            loading={savingChanges}
          >
            {savingChanges ? "Saving" : "Save"}
          </Button>
        </Col>
      </Row>
    );
  };

  const renderBillingAddress = () => {
    return (
      <React.Fragment>
        <h6 className="heading-small text-muted mb-4">Billing address</h6>
        <div className="pl-lg-4">
          <Row>
            <Col md="4">
              <FormGroup>
                <label className="form-control-label" htmlFor="input-address-line1">
                  Line 1
                </label>
                <Input
                  className="form-control-alternative"
                  id="input-address-line1"
                  placeholder="Street"
                  type="text"
                  value={userAddrLine1}
                  onChange={(e) => {
                    setAreChangesPending(true);
                    setUserAddrLine1(e.target.value);
                  }}
                />
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <label className="form-control-label" htmlFor="input-address-line2">
                  Line 2
                </label>
                <Input
                  className="form-control-alternative"
                  id="input-address-line2"
                  placeholder="Appartment"
                  type="text"
                  value={userAddrLine2}
                  onChange={(e) => {
                    setAreChangesPending(true);
                    setUserAddrLine2(e.target.value);
                  }}
                />
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <label className="form-control-label" htmlFor="input-address-city">
                  City
                </label>
                <Input
                  className="form-control-alternative"
                  id="input-address-city"
                  placeholder="City"
                  type="text"
                  value={userAddrCity}
                  onChange={(e) => {
                    setAreChangesPending(true);
                    setUserAddrCity(e.target.value);
                  }}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col lg="4">
              <FormGroup>
                <label className="form-control-label" htmlFor="input-state">
                  State
                </label>
                <Input
                  className="form-control-alternative"
                  id="input-state"
                  placeholder="State"
                  type="text"
                  value={userAddrState}
                  onChange={(e) => {
                    setAreChangesPending(true);
                    setUserAddrState(e.target.value);
                  }}
                />
              </FormGroup>
            </Col>
            <Col lg="4">
              <FormGroup>
                <label className="form-control-label" htmlFor="input-country">
                  Country
                </label>
                <Select
                  styles={APP_CONSTANTS.STYLES.reactSelectCustomStyles}
                  id="input-country"
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 4,
                    colors: {
                      ...theme.colors,
                      primary: "#141414",
                      primary25: "#2b2b2b",
                      neutral0: "#141414",
                    },
                  })}
                  className="form-control-alternative"
                  classNamePrefix="form-control-alternative"
                  placeholder="eg. United States"
                  options={APP_CONSTANTS.PRICING.COUNTRY_CODES}
                  value={
                    isEmpty(userAddrCountry)
                      ? null
                      : {
                          value: userAddrCountry,
                          label: getCountryNameFromISOCode(userAddrCountry),
                        }
                  }
                  onChange={(selectedValue) => {
                    setAreChangesPending(true);
                    setUserAddrCountry(selectedValue.value);
                  }}
                />
              </FormGroup>
            </Col>
            <Col lg="4">
              <FormGroup>
                <label className="form-control-label" htmlFor="input-zip-code">
                  ZIP/Postal Code
                </label>
                <Input
                  className="form-control-alternative"
                  id="input-zip-code"
                  placeholder="eg. V6B 3K9"
                  type="text"
                  value={userAddrZIP}
                  onChange={(e) => {
                    setAreChangesPending(true);
                    setUserAddrZIP(e.target.value);
                  }}
                />
              </FormGroup>
            </Col>
          </Row>
        </div>
      </React.Fragment>
    );
  };

  useEffect(() => {
    // Initial values. Fetch full profile
    DataStoreUtils.getValue(["users", user.details.profile.uid]).then((userRef) => {
      if (!userRef) return;
      const { profile } = userRef;
      if (profile) {
        // Full Name
        profile["displayName"] && setUserFullName(profile["displayName"]);
        // Address
        if (profile["address"]) {
          // Address - Line 1
          profile["address"]["line1"] && setUserAddrLine1(profile["address"]["line1"]);
          // Address - Line 2
          profile["address"]["line2"] && setUserAddrLine2(profile["address"]["line2"]);
          // Address - City
          profile["address"]["city"] && setUserAddrCity(profile["address"]["city"]);
          // Address - State
          profile["address"]["state"] && setUserAddrState(profile["address"]["state"]);
          // Address - ZIP Code
          profile["address"]["postal_code"] && setUserAddrZIP(profile["address"]["postal_code"]);
          // Address - Country
          profile["address"]["country"] && setUserAddrCountry(profile["address"]["country"]);
        }
      }
    });
  }, [user]);

  return (
    <Card className={`profile-card ${shadow ? "profile-card-shadow" : ""}`}>
      <CardHeader className="border-0">
        <Row className="align-items-center">
          <Col xs="8">
            <h3 className="mb-0">{customHeading ? customHeading : "My account"}</h3>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <Form className="profile-card-form">
          <h6 className="heading-small text-muted mb-4">Basic information</h6>
          <div className="pl-lg-4">
            <Row className="profile-card-form-info">
              <FormGroup className="profile-card-form-field">
                <label className="form-control-label" htmlFor="input-name">
                  Name
                </label>
                <Input
                  className="form-control-alternative"
                  value={userFullName}
                  id="input-name"
                  placeholder="Full Name"
                  type="text"
                  onChange={(e) => {
                    setAreChangesPending(true);
                    setUserFullName(e.target.value);
                  }}
                  style={{ textTransform: "capitalize" }}
                />
              </FormGroup>
              <FormGroup className="profile-card-form-field">
                <label className="form-control-label" htmlFor="input-email">
                  Email address
                </label>
                <Input
                  className="form-control-alternative"
                  id="input-email"
                  placeholder="Email address"
                  type="email"
                  disabled="disabled"
                  defaultValue={user.details.profile.email}
                  style={{ textTransform: "lowercase" }}
                />
              </FormGroup>

              <FormGroup className="profile-card-form-field">
                <label className="form-control-label" htmlFor="input-username">
                  Username
                </label>
                <Input
                  className="form-control-alternative"
                  id="input-username"
                  placeholder="Username"
                  type="text"
                  value={username}
                  style={{ textTransform: "lowercase" }}
                  onChange={(e) => {
                    setAreChangesPending(true);
                    handleOnUsernameChange(e.target.value);
                  }}
                />
                <Typography.Text type="danger">{usernameError}</Typography.Text>
              </FormGroup>
            </Row>
          </div>

          {/* Address */}
          {hideBillingAddress ? <React.Fragment></React.Fragment> : renderBillingAddress()}
          {renderSaveButton()}
        </Form>
      </CardBody>
    </Card>
  );
};

export default UserInfo;
