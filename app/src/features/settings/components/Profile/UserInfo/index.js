import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Card, CardHeader, Col, CardBody, FormGroup, Form, Input } from "reactstrap";
import { Typography } from "antd";
import { toast } from "utils/Toast.js";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { updateUserProfile } from "./actions";
import { updateUsername } from "backend/auth/username";
import { globalActions } from "store/slices/global/slice";
import { trackUsernameUpdated } from "modules/analytics/events/misc/username";
import { getUser } from "backend/user/getUser";
import { RQButton } from "lib/design-system-v2/components";

const UserInfo = ({ customHeading, shadow }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;

  const [userProfile, setUserProfile] = useState(null);
  const [usernameError, setUsernameError] = useState("");

  const [areChangesPending, setAreChangesPending] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);

  const userFullName = userProfile?.displayName ?? "";
  const username = userProfile?.username ?? "";
  const isBrowserstackUser = !!userProfile?.browserstackId;

  // TODO: get user profile from redux
  useEffect(() => {
    if (!uid) {
      return;
    }

    // Initial values. Fetch full profile
    getUser(uid).then((profile) => {
      if (profile) {
        setUserProfile(profile);
      }
    });
  }, [uid]);

  const handleOnUsernameChange = (username) => {
    setAreChangesPending(true);
    setUserProfile((prev) => ({ ...(prev ?? {}), username }));
  };

  const handleDisplayNameChange = (displayName) => {
    if (isBrowserstackUser) {
      return;
    }

    setAreChangesPending(true);
    setUserProfile((prev) => ({ ...(prev ?? {}), displayName }));
  };

  const handleSaveProfileOnClick = () => {
    if (!userFullName) {
      toast.warn("Name cannot be empty!");
      return;
    }

    setSavingChanges(true);

    Promise.all([
      updateUserProfile(user.details.profile.uid, {
        displayName: userFullName,
      }).then(() => {
        if (userFullName) {
          dispatch(globalActions.updateUserDisplayName(userFullName));
        }
      }),
      updateUsername(user?.details?.profile?.uid, username)
        .then(() => {
          trackUsernameUpdated(username, user?.details?.username);
          setUsernameError("");
          dispatch(
            globalActions.updateUsername({
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

  const renderSaveButton = (
    <Row className="align-items-center">
      <Col className="text-center" xs="12">
        <RQButton
          type="primary"
          disabled={!areChangesPending}
          onClick={handleSaveProfileOnClick}
          loading={savingChanges}
        >
          {savingChanges ? "Saving" : "Save"}
        </RQButton>
      </Col>
    </Row>
  );

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
                  disabled={isBrowserstackUser}
                  id="input-name"
                  placeholder="Full Name"
                  type="text"
                  onChange={(e) => {
                    handleDisplayNameChange(e.target.value);
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
                    handleOnUsernameChange(e.target.value);
                  }}
                />
                <Typography.Text type="danger">{usernameError}</Typography.Text>
              </FormGroup>
            </Row>
          </div>
          {renderSaveButton}
        </Form>
      </CardBody>
    </Card>
  );
};

export default UserInfo;
