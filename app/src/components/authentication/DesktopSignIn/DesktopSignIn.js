import React, { useCallback, useEffect, useState } from "react";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import { FaSpinner } from "@react-icons/all-files/fa/FaSpinner";
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
//UTILS
import { getEmailType } from "utils/mailCheckerUtils";
//EVENTS
import {
  trackSignupSuccessEvent,
  trackSignUpAttemptedEvent,
  trackSignUpFailedEvent,
} from "modules/analytics/events/common/auth/signup";
//CONSTANTS
import { AUTH_PROVIDERS } from "modules/analytics/constants";
import { trackLoginAttemptedEvent, trackLoginSuccessEvent } from "modules/analytics/events/common/auth/login";
import { redirectToDesktopApp, redirectToWebAppHomePage } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";

const DesktopSignIn = () => {
  //Component State
  const [allDone, setAllDone] = useState(false);
  const [isError, setIsError] = useState(false);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDoneSignIn = useCallback(
    async (firebaseUser, isNewUser = false) => {
      const params = new URLSearchParams(window.location.search);
      const token = await firebaseUser?.getIdToken();
      const code = params.get("ot-auth-code");
      const source = params.get("source").replace(/ /g, "_");
      const functions = getFunctions();
      const createAuthToken = httpsCallable(functions, "auth-createAuthToken");

      let uid = firebaseUser?.uid || null;
      let email = firebaseUser?.email || null;

      const emailType = await getEmailType(email);

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
              email_type: emailType,
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
      const params = new URLSearchParams(window.location.search);
      if (params.has("ot-auth-code")) {
        // triggering signin only if this was triggered properly from the desktop app
        const auth = getAuth(firebaseApp);
        getRedirectResult(auth).then(async (result) => {
          if (result && result.user) {
            let isNewUser = getAdditionalUserInfo(result).isNewUser || false;
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
      } else {
        redirectToWebAppHomePage(navigate);
      }
    }
  }, [allDone, handleDoneSignIn, navigate]);

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
