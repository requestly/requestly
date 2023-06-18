import React, { useCallback, useEffect, useState } from "react";
import { FaCheck, FaExclamationCircle, FaSpinner } from "react-icons/fa";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { getUserPersonaSurveyDetails } from "store/selectors";
import { syncUserPersona } from "components/misc/PersonaSurvey/utils";
// Firebase
// import firebase from "../../../firebase";
import firebaseApp from "../../../firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  getAdditionalUserInfo,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
} from "firebase/auth";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { createNewUsername } from "backend/auth/username";
//UTILS
import { getEmailType } from "utils/FormattingHelper";
//EVENTS
import {
  trackSignupSuccessEvent,
  trackSignUpAttemptedEvent,
  trackSignUpFailedEvent,
} from "modules/analytics/events/common/auth/signup";
//CONSTANTS
import { AUTH_PROVIDERS } from "modules/analytics/constants";
import { trackLoginAttemptedEvent, trackLoginSuccessEvent } from "modules/analytics/events/common/auth/login";
import Logger from "lib/logger";
import { redirectToDesktopApp } from "utils/RedirectionUtils";

const DesktopSignIn = () => {
  //Component State
  const [allDone, setAllDone] = useState(false);
  const [isError, setIsError] = useState(false);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const dispatch = useDispatch();

  const handleDoneSignIn = useCallback(
    async (firebaseUser, isNewUser = "false") => {
      const params = new URLSearchParams(window.location.search);
      const token = await firebaseUser?.getIdToken();
      const code = params.get("ot-auth-code");
      const source = params.get("source").replace(/ /g, "_");
      const functions = getFunctions();
      const createAuthToken = httpsCallable(functions, "createAuthToken");

      let uid = firebaseUser?.uid || null;
      let email = firebaseUser?.email || null;

      createAuthToken({
        oneTimeCode: code,
        idToken: token,
      })
        .then(() => {
          setAllDone(true);
          syncUserPersona(uid, dispatch, userPersona);
          if (isNewUser) {
            trackSignUpAttemptedEvent({
              auth_provider: AUTH_PROVIDERS.GMAIL,
              source,
            });
            trackSignupSuccessEvent({
              auth_provider: AUTH_PROVIDERS.GMAIL,
              email,
              uid,
              email_type: getEmailType(email),
              domain: email.split("@")[1],
              source,
            });
          } else {
            trackLoginAttemptedEvent({
              auth_provider: AUTH_PROVIDERS.GMAIL,
            });
            trackLoginSuccessEvent({
              auth_provider: AUTH_PROVIDERS.GMAIL,
            });
          }
          // window.close();
          redirectToDesktopApp();
        })
        .catch((err) => {
          setIsError(true);
          trackSignUpFailedEvent({
            auth_provider: AUTH_PROVIDERS.GMAIL,
            error_message: err.message,
            source,
          });
          // window.close();
        });
    },
    [dispatch, userPersona]
  );

  const renderLoading = () => {
    if (isError) {
      return renderErrorMessage();
    } else if (allDone) {
      return renderAllDone();
    }
    return (
      <h4 className="display-6 desktop-auth-message">
        <FaSpinner className="icon-spin mr-2" />
        Authenticating
      </h4>
    );
  };

  const renderAllDone = () => {
    return (
      <h4 className="display-6 desktop-auth-message">
        <FaCheck className="mr-2" />
        You're now logged into the desktop app. This window can now be safely closed.
      </h4>
    );
  };

  const renderErrorMessage = () => {
    return (
      <h4 className="display-6 desktop-auth-message">
        <FaExclamationCircle className="mr-2" />
        An unexpected error has occurred. Please close this window and try logging in again
      </h4>
    );
  };

  useEffect(() => {
    if (!allDone) {
      const auth = getAuth(firebaseApp);
      getRedirectResult(auth).then(async (result) => {
        if (result && result.user) {
          let isNewUser = getAdditionalUserInfo(result).isNewUser || false;
          if (isNewUser) {
            createNewUsername(result?.user?.uid)
              .then((username) => {
                // Do Nothing
              })
              .catch((e) => Logger.error(e));
          }
          // User just signed in. we can get the result.credential or result.user
          await handleDoneSignIn(result.user, isNewUser);
        } else if (auth.currentUser) {
          // User already signed in.
          await handleDoneSignIn(auth.currentUser);
        } else {
          // No user signed in, update your UI, show the sign in button.
          // Initiate Google Sign-in for desktop app.
          // At this state, a unique code has already been generated by the desktop app, passed here as a qury param
          const provider = new GoogleAuthProvider();
          signInWithRedirect(auth, provider);
        }
      });
    }
  }, [allDone, handleDoneSignIn]);

  return (
    <React.Fragment>
      {/* Page content */}
      <Container className=" mt--5" fluid>
        {/* Table */}
        <Row>
          <div className=" col">
            <Card className=" shadow">
              <CardBody>
                <Row>
                  <Col lg="12" md="12" className="text-center">
                    <Jumbotron style={{ background: "transparent" }} className="text-center">
                      {renderLoading()}
                    </Jumbotron>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
    </React.Fragment>
  );
};

export default DesktopSignIn;
