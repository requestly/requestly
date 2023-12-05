import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Col, Row, Typography } from "antd";
import { PersonaInput } from "./components/PersonaInput";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import { actions } from "store";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import "./index.scss";

export const PersonaScreen = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [persona, setPersona] = useState("");
  const getUserPersona = useMemo(() => httpsCallable(getFunctions(), "users-getUserPersona"), []);
  const setUserPersona = useMemo(() => httpsCallable(getFunctions(), "users-setUserPersona"), []);

  const handleSaveClick = () => {
    setIsSaving(true);
    setUserPersona({ persona })
      .then((res: any) => {
        if (res.data.success) {
          dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.GETTING_STARTED));
        }
      })
      .catch((error) => {
        Logger.log(error);
        toast.error("Something went wrong. Please try again later.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  useEffect(() => {
    getUserPersona().then((res: any) => {
      if (res.data.persona) {
        dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.GETTING_STARTED));
      } else setIsLoading(false);
    });
  }, [getUserPersona, dispatch]);

  return (
    <div className="persona-form-wrapper">
      {isLoading ? (
        <h2>SETTING UP...</h2> //TODO: ADD LOADER HERE
      ) : (
        <>
          <div className="persona-form">
            <Row gutter={16} align="middle">
              <Col className="login-success-icon display-row-center">
                <MdCheck className="text-white" />
              </Col>
              <Col>
                <Typography.Title level={4} style={{ fontWeight: 500, marginBottom: 0 }}>
                  You’re logged in successfully!
                </Typography.Title>
              </Col>
            </Row>
            <Typography.Title level={5} style={{ marginTop: "24px", fontWeight: 500 }}>
              Helps us in optimizing your experience
            </Typography.Title>
            <Col className="mt-16">
              <PersonaInput onValueChange={(value) => setPersona(value)} />
            </Col>
            {/* <div className="onboarding-form-input mt-8">
              <label htmlFor="full-name">Your full name</label>
              <RQInput placeholder="E.g., you@company.com" id="full-name" />
            </div> */}
            <RQButton
              disabled={!persona}
              loading={isSaving}
              onClick={handleSaveClick}
              type="primary"
              size="large"
              className="persona-save-btn w-full mt-16"
            >
              Save
            </RQButton>
          </div>
        </>
      )}
    </div>
  );
};
