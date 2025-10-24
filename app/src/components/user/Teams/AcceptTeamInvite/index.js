import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Space } from "antd";
import { FaExclamationCircle } from "@react-icons/all-files/fa/FaExclamationCircle";
import { Row, Col, Container, Card, CardBody } from "reactstrap";
// FIREBASE
import { getFunctions, httpsCallable } from "firebase/functions";
// SUB COMPONENTS
import SpinnerColumn from "../../../misc/SpinnerColumn";
import { isEmpty } from "lodash";
// UTILS
import { redirectToAccountDetails } from "../../../../utils/RedirectionUtils";
import { toast } from "utils/Toast.js";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

const cleanInviteCode = (inviteCode) => {
  if (!inviteCode || isEmpty(inviteCode) || typeof inviteCode !== "string")
    throw new Error("Cant parse the invite code");
  // Step 1 - Remove forward slash
  const step1 = inviteCode.replace(/\//g, "");
  // Step 2 - Remove a backword slash
  const step2 = step1.replace(/\\/g, "");

  return step2;
};

const AcceptTeamInvite = () => {
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const urlParams = new URLSearchParams(window.location.search);
  const inviteCode = urlParams.get("code");
  // Component State
  const [isLoading, setIsLoading] = useState(true);
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [teamName, setTeamName] = useState("");

  const doGetTeamInvite = () => {
    setIsLoading(true);
    const functions = getFunctions();
    const getTeamInvite = httpsCallable(functions, "getTeamInvite");

    getTeamInvite({
      inviteCode: cleanInviteCode(inviteCode),
    })
      .then((res) => {
        if (!mountedRef.current) return null;
        const response = res.data;
        if (response.success) {
          setIsCodeValid(true);
          setTeamName(response.teamName);
        } else {
          setIsCodeValid(false);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (!mountedRef.current) return null;
        setIsCodeValid(false);
        setIsLoading(false);
      });
  };

  const stableGetTeamInvite = useCallback(doGetTeamInvite, [inviteCode]);

  const doAcceptTeamInvite = () => {
    setIsProcessing(true);
    const functions = getFunctions();
    const acceptTeamInvite = httpsCallable(functions, "acceptTeamInvite");

    acceptTeamInvite({
      inviteCode: cleanInviteCode(inviteCode),
    })
      .then((res) => {
        if (!mountedRef.current) return null;
        const response = res.data;
        setIsProcessing(false);
        if (response.success) {
          toast.info("You have been added to the team");
          redirectToAccountDetails(navigate, true);
        } else {
          toast.warn(response.message);
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return null;
        toast.warn(err.message);
      });
  };

  const renderAcceptInviteWindow = () => {
    if (!teamName || isEmpty(teamName)) {
      return <></>;
    }
    return (
      <Col>
        <div style={{ textAlign: "center" }}>
          <h4>
            You have been invited to join the team: <span style={{ textTransform: "capitalize" }}>{teamName}</span>{" "}
          </h4>
          {isProcessing ? (
            <React.Fragment>
              <br />
              <h5>
                <FaExclamationCircle color="orange" /> This process may take a few seconds. Do not close this page.
              </h5>
            </React.Fragment>
          ) : null}

          <br />
          <Space>
            <Button
              className="btn-icon btn-3"
              color="primary"
              type="button"
              disabled={isProcessing}
              onClick={doAcceptTeamInvite}
              icon={<CheckCircleFilled />}
              loading={isProcessing}
            >
              {isProcessing ? "Accepting" : "Accept Invite"}
            </Button>
            <Button
              className="btn-icon btn-3"
              color="primary"
              outline
              type="button"
              disabled={isProcessing}
              onClick={() => redirectToAccountDetails(navigate)}
              icon={<CloseCircleFilled />}
            >
              Ignore Invite
            </Button>
          </Space>
        </div>
      </Col>
    );
  };

  const renderLoader = () => {
    return <SpinnerColumn message="Verifying invite" />;
  };

  const renderInvalidCode = () => {
    return (
      <Col>
        <Jumbotron style={{ background: "transparent" }} className="text-center">
          <h4>
            This invite has either been expired or is not meant for you. Please ask the team owner to add you directly.
          </h4>
          <br />
          <br />
          <br />
          <h4>
            Click{" "}
            <span className="cursor-pointer" onClick={() => redirectToAccountDetails(navigate)}>
              here
            </span>{" "}
            to go back to account settings.
          </h4>
        </Jumbotron>
      </Col>
    );
  };

  useEffect(() => {
    if (!inviteCode || isEmpty(inviteCode)) {
      setIsCodeValid(false);
      setIsLoading(false);
    } else {
      stableGetTeamInvite();
    }
    // Cleanup
    return () => {
      mountedRef.current = false;
    };
  }, [inviteCode, stableGetTeamInvite]);

  return (
    <Container className=" mt--7" fluid>
      {/* Table */}
      <Row>
        <Col>
          <Card className=" shadow">
            <CardBody>
              <Row>{isLoading ? renderLoader() : isCodeValid ? renderAcceptInviteWindow() : renderInvalidCode()}</Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AcceptTeamInvite;
