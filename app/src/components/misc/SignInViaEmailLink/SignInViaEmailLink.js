import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { Redirect } from "react-router-dom";
import { Form, FormGroup, Input } from "reactstrap";
import { Col, Row, Container, Card, Button, CardBody } from "reactstrap";
// ICONS
import { FaSpinner } from "@react-icons/all-files/fa/FaSpinner";
//UTILS
import { getAppMode, getUserAuthDetails } from "../../../store/selectors";
import { getQueryParamsAsMap } from "../../../utils/URLUtils";
import { isEmailValid } from "../../../utils/FormattingHelper";
// ACTIONS
import { signInWithEmailLink } from "../../../actions/FirebaseActions";
import { handleLogoutButtonOnClick } from "../../authentication/AuthForm/actions";
import { toast } from "utils/Toast.js";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { actions } from "store";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

const SignInViaEmailLink = () => {
  //Component State
  const [userEmail, setUserEmail] = useState(
    isEmailValid(window.localStorage.getItem("RQEmailForSignIn"))
      ? window.localStorage.getItem("RQEmailForSignIn")
      : null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const handleLogin = (e) => {
    setIsProcessing(true);
    e.preventDefault();

    if (user.loggedIn) {
      handleLogoutButtonOnClick(appMode, isWorkspaceMode, dispatch).then(() => {
        dispatch(actions.updateRefreshPendingStatus({ type: "rules" }));
      });
    }

    const params = getQueryParamsAsMap();
    if (params[`oobCode`] && isEmailValid(userEmail)) {
      signInWithEmailLink(userEmail)
        .then((resp) => {
          if (resp) {
            setIsProcessing(false);
          } else throw new Error("Failed");
        })
        .catch((err) => {
          toast.error("URL seems invalid. Please contact support");
          setIsProcessing(false);
          setUserEmail(null);
        });
    } else {
      toast.error("Please recheck the email entered, or this URL is invalid.");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      document.getElementById("SignInViaEmailLinkLoginBtn").click();
    }, 300);
  }, []);

  return (
    <Container className=" mt--7 sm-margin-top-negative-3" fluid>
      <Row>
        <Col>
          <Card className="shadow">
            <CardBody>
              <Jumbotron style={{ background: "transparent" }} className="text-center">
                <Row className="justify-content-md-center">
                  <Col lg="3">
                    <Form>
                      <FormGroup>
                        <label htmlFor="SignInViaEmailLinkInputField">Confirm email address</label>
                        <Input
                          id="SignInViaEmailLinkInputField"
                          placeholder="name@example.com"
                          type="email"
                          value={userEmail ? userEmail : ""}
                          onChange={(e) => {
                            setUserEmail(e.target.value);
                          }}
                        />
                      </FormGroup>
                      <FormGroup>
                        {userEmail && isProcessing ? (
                          <Button color="primary" type="button" disabled>
                            <FaSpinner className="icon-spin mr-2" />
                            Login
                          </Button>
                        ) : (
                          <Button color="primary" type="button" onClick={handleLogin} id="SignInViaEmailLinkLoginBtn">
                            Login
                          </Button>
                        )}
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>
              </Jumbotron>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignInViaEmailLink;
