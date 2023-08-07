import React, { useMemo, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserPersonaSurveyDetails, getAppMode } from "store/selectors";
import { actions } from "store";
import { SurveyModalFooter } from "./ModalFooter";
import { SurveyConfig, OptionsConfig } from "./config";
import { getSurveyPage, shouldShowOnboarding, shuffleOptions } from "./utils";
import { handleSurveyNavigation } from "./actions";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { Option, QuestionnaireType, SurveyPage } from "./types";
import { SurveyOption } from "./Option";
import { RQButton, RQModal } from "lib/design-system/components";
import { trackPersonaSurveySignInClicked, trackPersonaSurveyViewed } from "modules/analytics/events/misc/personaSurvey";
import { AUTH } from "modules/analytics/events/common/constants";
import APP_CONSTANTS from "config/constants";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import PATHS from "config/constants/sub/paths";
import "./index.css";

interface SurveyProps {
  callback?: () => void;
  isSurveyModal: boolean;
  isOpen?: boolean;
}

const SkipButton = () => {
  const dispatch = useDispatch();

  return (
    <div className="skip-recommendation-wrapper">
      Existing user?
      <RQButton
        className="skip-recommendation-btn persona-login-btn"
        type="link"
        onClick={() => {
          trackPersonaSurveySignInClicked();
          dispatch(
            actions.toggleActiveModal({
              modalName: "authModal",
              newProps: {
                callback: () => {
                  dispatch(actions.updateIsPersonaSurveyCompleted(true));
                },
                authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
                eventSource: AUTH.SOURCE.PERSONA_SURVEY,
              },
            })
          );
        }}
      >
        Sign in
      </RQButton>
    </div>
  );
};

export const PersonaSurvey: React.FC<SurveyProps> = ({ callback, isSurveyModal, isOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const currentPage = useMemo(() => getSurveyPage(userPersona.page), [userPersona.page]);

  const shuffledQuestionnaire = useMemo(() => {
    if (currentPage === SurveyPage.RECOMMENDATIONS || currentPage === SurveyPage.GETTING_STARTED) return;
    const options = OptionsConfig[currentPage]?.options;
    return shuffleOptions(options);
  }, [currentPage]);

  const renderOptions = useCallback((options: Option[], questionnaire: QuestionnaireType) => {
    return (
      <div className="survey-options-container">
        {options.map((option: Option, index: number) => (
          <SurveyOption
            key={index}
            option={option}
            action={OptionsConfig[questionnaire].questionResponseAction}
            questionnaire={questionnaire}
          />
        ))}
      </div>
    );
  }, []);

  const renderQuestionnaire = useCallback(
    (questionnaire: QuestionnaireType) => {
      if (questionnaire) return renderOptions(shuffledQuestionnaire, questionnaire);
    },
    [shuffledQuestionnaire, renderOptions]
  );

  const currentSurveyPage = useMemo(() => {
    const page = SurveyConfig[currentPage as SurveyPage];
    const shouldShowPage = page?.visibility({ userPersona });
    if (shouldShowPage) {
      return (
        <>
          {currentPage === SurveyPage.GETTING_STARTED && <SkipButton />}
          <div className="text-center white text-bold survey-title">{page?.title}</div>
          <div className="w-full survey-subtitle-wrapper">
            <div className="text-gray text-center mt-8">{page?.subTitle}</div>
          </div>
          <>{typeof page?.render === "function" ? page?.render() : renderQuestionnaire(page?.render)}</>
        </>
      );
    } else handleSurveyNavigation(currentPage, dispatch);
  }, [renderQuestionnaire, currentPage, dispatch, userPersona]);

  const handleMoveToRecommendationScreen = useCallback(() => {
    const isRecommendationScreen = currentPage === SurveyPage.RECOMMENDATIONS;
    dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal", newValue: !isRecommendationScreen }));
    if (isRecommendationScreen) {
      navigate(PATHS.GETTING_STARTED, {
        replace: true,
        state: {
          src: "persona_survey_modal",
          redirectTo: window.location.pathname,
        },
      });
    }
  }, [currentPage, dispatch, navigate]);

  useEffect(() => {
    if (
      SurveyConfig[currentPage as SurveyPage]?.skip ||
      (!isSurveyModal && currentPage === SurveyPage.GETTING_STARTED)
    ) {
      handleSurveyNavigation(currentPage, dispatch);
    }
  }, [currentPage, dispatch, isSurveyModal]);

  useEffect(() => {
    if (isSurveyModal) {
      shouldShowOnboarding(appMode).then((result) => {
        if (result) {
          if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
            dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal", newValue: true }));
          } else if (isExtensionInstalled()) handleMoveToRecommendationScreen();
        }
      });
    }
  }, [appMode, currentPage, dispatch, navigate, isSurveyModal, handleMoveToRecommendationScreen]);

  useEffect(() => {
    if (currentPage === SurveyPage.GETTING_STARTED) {
      shouldShowOnboarding(appMode).then((result) => {
        if (result) {
          if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP || isExtensionInstalled()) trackPersonaSurveyViewed();
        }
      });
    }
  }, [appMode, currentPage]);

  useEffect(() => {
    if (userPersona?.page > 2) dispatch(actions.updateIsPersonaSurveyCompleted(true));
  }, [dispatch, userPersona?.page]);

  useEffect(() => {
    if (!(currentPage in SurveyConfig)) {
      if (isSurveyModal) dispatch(actions.updatePersonaSurveyPage(SurveyPage.RECOMMENDATIONS));
      else callback?.();
    }
  }, [currentPage, dispatch, callback, isSurveyModal]);

  const surveyPages = useMemo(
    () => <>{currentPage !== SurveyPage.RECOMMENDATIONS ? <>{currentSurveyPage}</> : null}</>,
    [currentSurveyPage, currentPage]
  );

  return (
    <>
      {isSurveyModal ? (
        <RQModal
          open={isOpen}
          centered
          closable={false}
          className="survey-modal"
          bodyStyle={{ width: "550px" }}
          maskStyle={{ background: "#0D0D10" }}
        >
          <div className="persona-survey-container">
            {surveyPages}
            <SurveyModalFooter isSurveyModal={isSurveyModal} currentPage={currentPage} callback={callback} />
          </div>
        </RQModal>
      ) : (
        <div className="persona-survey-container">
          {surveyPages}
          <SurveyModalFooter isSurveyModal={isSurveyModal} currentPage={currentPage} callback={callback} />
        </div>
      )}
    </>
  );
};
