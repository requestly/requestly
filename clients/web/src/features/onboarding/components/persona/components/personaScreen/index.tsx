import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getAppOnboardingDetails } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Col, Row, Typography } from "antd";
import { PersonaInput } from "../PersonaInput";
import { RQButton, RQInput } from "lib/design-system/components";
import { globalActions } from "store/slices/global/slice";
import { ONBOARDING_STEPS } from "features/onboarding/types";
import { MdCheck } from "@react-icons/all-files/md/MdCheck";
import Logger from "lib/logger";
import { toast } from "utils/Toast";
import { getValueAsPromise, updateUserInFirebaseAuthUser, updateValueAsPromise } from "actions/FirebaseActions";
import { OnboardingLoader } from "features/onboarding/components/loader";
import { m, AnimatePresence } from "framer-motion";
import {
  trackAppOnboardingIndustryUpdated,
  trackAppOnboardingNameUpdated,
  trackAppOnboardingPersonaUpdated,
  trackAppOnboardingStepCompleted,
  trackAppOnboardingViewed,
} from "features/onboarding/analytics";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { getUserPersona, setUserPersona, updateUserIndustry } from "backend/onboarding";
import { getAppFlavour } from "utils/AppUtils";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { IndustryInput } from "../IndustryInput";
import "./index.scss";
import { redirectToWebAppHomePage } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { isCompanyEmail } from "utils/mailCheckerUtils";

interface Props {
  isOpen: boolean;
}

export const PersonaScreen: React.FC<Props> = ({ isOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const appOnboardingDetails = useSelector(getAppOnboardingDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [persona, setPersona] = useState("");
  const [industry, setIndustry] = useState("");
  const [fullName, setFullName] = useState("");
  const [shouldShowPersonaInput, setShouldShowPersonaInput] = useState(false);
  const [shouldShowFullNameInput, setShouldShowFullNameInput] = useState(false);

  const handleMoveToNextStep = useCallback(() => {
    const appFlavour = getAppFlavour();

    if (appFlavour === GLOBAL_CONSTANTS.APP_FLAVOURS.SESSIONBEAR) {
      dispatch(globalActions.updateAppOnboardingCompleted());
      return;
    }

    if (user?.loggedIn && isCompanyEmail(user.details?.emailType) && user?.details?.profile?.isEmailVerified) {
      dispatch(globalActions.updateAppOnboardingStep(ONBOARDING_STEPS.TEAMS));
    } else {
      redirectToWebAppHomePage(navigate);
      dispatch(globalActions.updateAppOnboardingCompleted());
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "appOnboardingModal",
          newValue: false,
        })
      );
    }
  }, [dispatch, navigate, user.details?.emailType, user.details?.profile?.isEmailVerified, user?.loggedIn]);

  const handleSetPersona = useCallback(() => {
    if (persona) {
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.PERSONA, persona);
      dispatch(globalActions.updateAppOnboardingPersona(persona));
      if (!user.loggedIn) {
        trackAppOnboardingPersonaUpdated(persona);
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        setUserPersona(user.details?.profile?.uid, persona)
          .then((res: any) => {
            if (res.success) {
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
  }, [persona, dispatch, user.details?.profile?.uid, user.loggedIn]);

  const handleUpdateIndustry = useCallback(() => {
    if (!industry) {
      return Promise.resolve();
    }

    submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.INDUSTRY, industry);

    // @ts-ignore
    dispatch(globalActions.updateAppOnboardingIndustry(industry));

    if (!user.loggedIn) {
      trackAppOnboardingIndustryUpdated(industry);
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      updateUserIndustry(user.details?.profile?.uid, industry)
        .then((res: any) => {
          if (res.success) {
            trackAppOnboardingIndustryUpdated(industry);
            resolve(res);
          }
        })
        .catch((error) => {
          Logger.log(error);
          reject(error);
        });
    });
  }, [industry, dispatch, user.details?.profile?.uid, user.loggedIn]);

  const handleSetFullName = useCallback(() => {
    if (fullName) {
      dispatch(globalActions.updateAppOnboardingFullName(fullName));
      return new Promise((resolve, reject) => {
        updateValueAsPromise(["users", user.details?.profile?.uid, "profile"], { displayName: fullName })
          .then((res: any) => {
            resolve(res);
            submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.DISPLAY_NAME, fullName);
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
    if (shouldShowFullNameInput && !fullName) {
      toast.error("Please enter your full name");
      return;
    }

    if (shouldShowPersonaInput && !persona) {
      toast.error("Please select a persona");
      return;
    }

    if (!industry) {
      toast.error("Please select a industry");
      return;
    }

    setIsSaving(true);
    Promise.all([
      handleSetPersona(),
      handleUpdateIndustry(),
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
    industry,
    fullName,
    handleSetPersona,
    handleUpdateIndustry,
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
    getUserPersona(user.details?.profile?.uid)
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
  }, [dispatch, appOnboardingDetails.persona, user.loggedIn, user.details?.profile?.uid]);

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
                        You’re signed in successfully!
                      </Typography.Title>
                    </Col>
                  </Row>
                )}
                <Typography.Title level={5} style={{ marginTop: user.loggedIn ? "24px" : 0, fontWeight: 500 }}>
                  Help us in optimizing your experience
                </Typography.Title>

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

                {shouldShowPersonaInput && (
                  <Col className="mt-16">
                    <PersonaInput value={persona} onValueChange={(value) => setPersona(value)} />
                  </Col>
                )}

                <Col className="mt-16">
                  <IndustryInput value={industry} onValueChange={(value) => setIndustry(value)} />
                </Col>

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
