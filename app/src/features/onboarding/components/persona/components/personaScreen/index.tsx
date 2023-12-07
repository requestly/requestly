import { useState, useEffect, useMemo, useCallback } from "react";
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
import { updateUserInFirebaseAuthUser, updateValueAsPromise } from "actions/FirebaseActions";
import "./index.scss";

export const PersonaScreen = () => {
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

  const handleSetPersona = useCallback(() => {
    if (persona) {
      dispatch(actions.updateAppOnboardingPersona(persona));
      return new Promise((resolve, reject) => {
        setUserPersona({ persona })
          .then((res: any) => {
            if (res.data.success) {
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
          })
          .catch((error) => {
            Logger.log(error);
            reject(error);
          });
      });
    } else return Promise.resolve();
  }, [dispatch, fullName, user.details?.profile?.uid]);

  const handleSaveClick = () => {
    setIsSaving(true);
    Promise.all([
      handleSetPersona(),
      handleSetFullName(),
      updateUserInFirebaseAuthUser({ displayName: fullName || user.details?.profile?.displayName }),
    ])
      .then(() => {
        dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.GETTING_STARTED));
      })
      .catch((error) => {
        Logger.log(error);
        dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.GETTING_STARTED));
        toast.error("Something went wrong.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const shouldProceedToGettingStarted = useCallback(() => {
    if (!shouldShowFullNameInput && !shouldShowPersonaInput) {
      return true;
    } else return false;
  }, [shouldShowPersonaInput, shouldShowFullNameInput]);

  useEffect(() => {
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
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      });
  }, [getUserPersona, dispatch, appOnboardingDetails.persona]);

  useEffect(() => {
    if (user.loggedIn && user.details?.profile?.displayName === "User") {
      setShouldShowFullNameInput(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.loggedIn]);

  useEffect(() => {
    if (!isLoading && shouldProceedToGettingStarted()) {
      dispatch(actions.updateAppOnboardingStep(ONBOARDING_STEPS.GETTING_STARTED));
    }
  }, [dispatch, isLoading, shouldProceedToGettingStarted]);

  console.log(shouldProceedToGettingStarted());

  console.log({ shouldShowFullNameInput, shouldShowPersonaInput });

  return (
    <div className="persona-form-wrapper">
      {isLoading ? (
        <h2>SETTING UP...</h2> //TODO: ADD LOADER HERE
      ) : (
        <>
          {!shouldProceedToGettingStarted() ? (
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
              {shouldShowPersonaInput && (
                <Col className="mt-16">
                  <PersonaInput onValueChange={(value) => setPersona(value)} />
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
                // disabled={!persona}
                loading={isSaving}
                onClick={handleSaveClick}
                type="primary"
                size="large"
                className="persona-save-btn w-full mt-16"
              >
                Save
              </RQButton>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
