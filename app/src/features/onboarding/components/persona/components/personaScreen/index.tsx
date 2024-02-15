import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getAppOnboardingDetails, getUserAuthDetails } from "store/selectors";
import { Col, Row, Typography } from "antd";
import { PersonaInput } from "../PersonaInput";
import { RQButton, RQInput } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import { actions } from "store";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { getValueAsPromise, updateUserInFirebaseAuthUser, updateValueAsPromise } from "actions/FirebaseActions";
import { OnboardingLoader } from "features/onboarding/components/loader";
import { m, AnimatePresence } from "framer-motion";
import {
  trackAppOnboardingNameUpdated,
  trackAppOnboardingPersonaUpdated,
  trackAppOnboardingStepCompleted,
  trackAppOnboardingViewed,
} from "features/onboarding/analytics";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { isCompanyEmail } from "utils/FormattingHelper";
import "./index.scss";

interface Props {
  isOpen: boolean;
}

export const PersonaScreen: React.FC<Props> = ({ isOpen }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appOnboardingDetails = useSelector(getAppOnboardingDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [persona, setPersona] = useState("");
  const [fullName, setFullName] = useState("");
  const [shouldShowPersonaInput, setShouldShowPersonaInput] = useState(false);
  const [shouldShowFullNameInput, setShouldShowFullNameInput] = useState(false);

  const getUserPersona = useMemo(() => httpsCallable(getFunctions(), "users-getUserPersona"), []);
  const setUserPersona = useMemo(() => httpsCallable(getFunctions(), "users-setUserPersona"), []);

  const handleMoveToNextStep = useCallback(() => {
    if (user?.loggedIn && isCompanyEmail(user?.details?.profile?.email) && user?.details?.profile?.isEmailVerified) {
      dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.TEAMS));
    } else {
      dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.RECOMMENDATIONS));
    }
  }, [dispatch, user?.details?.profile?.email, user?.details?.profile?.isEmailVerified, user?.loggedIn]);

  const handleSetPersona = useCallback(() => {
    if (persona) {
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.PERSONA, persona);
      dispatch(actions.updateAppOnboardingPersona(persona));
      return new Promise((resolve, reject) => {
        setUserPersona({ persona })
          .then((res: any) => {
            if (res.data.success) {
              trackAppOnboardingPersonaUpdated(persona);
              resolve(res);
            }
          })
          .catch((error) => {
            Logger.log(error);
            reject(error);
          });
      });
    } else return Promise.resolve();
  }, [persona, dispatch, setUserPersona]);

  const handleSetFullName = useCallback(() => {
    if (fullName) {
      dispatch(actions.updateAppOnboardingFullName(fullName));
      return new Promise((resolve, reject) => {
        updateValueAsPromise(["users", user.details?.profile?.uid, "profile"], { displayName: fullName })
          .then((res: any) => {
            resolve(res);
            trackAppOnboardingNameUpdated();
          })
          .catch((error) => {
            Logger.log(error);
            reject(error);
          });
      });
    } else return Promise.resolve();
  }, [dispatch, fullName, user.details?.profile?.uid]);

  const handleSaveClick = useCallback(() => {
    //VALIDATION
    if (shouldShowPersonaInput && !persona) {
      toast.error("Please select a persona");
      return;
    }

    if (shouldShowFullNameInput && !fullName) {
      toast.error("Please enter your full name");
      return;
    }

    setIsSaving(true);
    Promise.all([
      handleSetPersona(),
      handleSetFullName(),
      updateUserInFirebaseAuthUser({ displayName: fullName || user.details?.profile?.displayName }),
    ])
      .then(() => {
        trackAppOnboardingStepCompleted(ONBOARDING_STEPS.PERSONA);
        handleMoveToNextStep();
      })
      .catch((error) => {
        Logger.log(error);
        trackAppOnboardingStepCompleted(ONBOARDING_STEPS.PERSONA);
        handleMoveToNextStep();
        if (user.loggedIn) {
          toast.error("Something went wrong.");
        }
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [
    handleMoveToNextStep,
    shouldShowFullNameInput,
    shouldShowPersonaInput,
    persona,
    fullName,
    handleSetPersona,
    handleSetFullName,
    user.details?.profile?.displayName,
    user.loggedIn,
  ]);

  const shouldProceedToNextStep = useCallback(() => {
    if (!shouldShowFullNameInput && !shouldShowPersonaInput) {
      return true;
    } else return false;
  }, [shouldShowPersonaInput, shouldShowFullNameInput]);

  useEffect(() => {
    if (!user.loggedIn) {
      setShouldShowPersonaInput(true);
      setIsLoading(false);
      return;
    }
    getUserPersona()
      .then((res: any) => {
        if (!res.data.persona) {
          setShouldShowPersonaInput(true);
        }
      })
      .catch((error) => {
        Logger.log(error);
        if (!appOnboardingDetails.persona) {
          setShouldShowPersonaInput(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [getUserPersona, dispatch, appOnboardingDetails.persona, user.loggedIn]);

  useEffect(() => {
    if (user.loggedIn) {
      getValueAsPromise(["users", user.details?.profile?.uid, "profile", "displayName"]).then((name) => {
        if (name === "User" || !name) {
          setShouldShowFullNameInput(true);
        }
      });
    }
  }, [user.loggedIn, user.details?.profile?.uid]);

  useEffect(() => {
    if (user.loggedIn && !isLoading && shouldProceedToNextStep()) {
      handleMoveToNextStep();
    }
  }, [isLoading, shouldProceedToNextStep, handleMoveToNextStep, user.loggedIn]);

  useEffect(() => {
    if (isOpen && !shouldProceedToNextStep()) {
      trackAppOnboardingViewed(ONBOARDING_STEPS.PERSONA);
    }
  }, [isOpen, shouldProceedToNextStep]);

  return (
    <>
      {isLoading ? (
        <OnboardingLoader />
      ) : (
        <div className="persona-form-wrapper">
          <AnimatePresence>
            {!shouldProceedToNextStep() ? (
              <m.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "linear", duration: 0.2 }}
                className="persona-form"
              >
                {user.loggedIn && (
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
                )}
                <Typography.Title level={5} style={{ marginTop: user.loggedIn ? "24px" : 0, fontWeight: 500 }}>
                  Helps us in optimizing your experience
                </Typography.Title>
                {shouldShowPersonaInput && (
                  <Col className="mt-16">
                    <PersonaInput value={persona} onValueChange={(value) => setPersona(value)} />
                  </Col>
                )}

                {shouldShowFullNameInput && (
                  <div className="onboarding-form-input mt-8">
                    <label htmlFor="full-name">Your full name</label>
                    <RQInput
                      placeholder="E.g. John Doe"
                      id="full-name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                      }}
                    />
                  </div>
                )}
                <RQButton
                  loading={isSaving}
                  onClick={handleSaveClick}
                  type="primary"
                  size="large"
                  className="persona-save-btn w-full mt-16"
                >
                  Proceed
                </RQButton>
              </m.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};
