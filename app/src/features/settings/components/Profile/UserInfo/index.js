import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Card, CardHeader, Col, CardBody, FormGroup, Form, Input } from "reactstrap";
import { Button, Typography } from "antd";
import { toast } from "utils/Toast.js";
// UTILS
import DataStoreUtils from "../../../../../utils/DataStoreUtils";
import { getUserAuthDetails } from "../../../../../store/selectors";
// ACTIONS
import { updateUserProfile } from "./actions";
// CONSTANTS
import { getUsername, updateUsername } from "backend/auth/username";
import { actions } from "store";
import { trackUsernameUpdated } from "modules/analytics/events/misc/username";

const UserInfo = ({ customHeading, shadow }) => {
  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);

  //Component State
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [areChangesPending, setAreChangesPending] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [userFullName, setUserFullName] = useState("");

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

  useEffect(() => {
    // Initial values. Fetch full profile
    DataStoreUtils.getValue(["users", user.details.profile.uid]).then((userRef) => {
      if (!userRef) return;
      const { profile } = userRef;
      if (profile) {
        // Full Name
        profile["displayName"] && setUserFullName(profile["displayName"]);
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

          {renderSaveButton()}
        </Form>
      </CardBody>
    </Card>
  );
};

export default UserInfo;
