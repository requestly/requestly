import React, { useMemo, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserPersonaSurveyDetails, getAppMode } from "store/selectors";
import { actions } from "store";
import { SurveyModalFooter } from "./ModalFooter";
import { SurveyConfig, OptionsConfig } from "./config";
import { getSurveyPage, shouldShowOnboarding, shuffleOptions } from "./utils";
import { handleSurveyNavigation } from "./actions";
import { Option, QuestionnaireType, SurveyPage } from "./types";
import { SurveyOption } from "./Option";
import { RQButton, RQModal } from "lib/design-system/components";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import {
  trackPersonaQ1Completed,
  trackPersonaSurveySignInClicked,
  trackPersonaSurveyViewed,
} from "modules/analytics/events/misc/onboarding";
import { AUTH } from "modules/analytics/events/common/constants";
import PATHS from "config/constants/sub/paths";
import APP_CONSTANTS from "config/constants";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
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

  const handleMoveToNextPage = useCallback(() => {
    const index = Object.keys(SurveyConfig).indexOf(currentPage);
    const surveyLength = Object.keys(SurveyConfig).length;
    const currentQuestionnaire = SurveyConfig[currentPage]?.render;
    const isSharedListUser = window.location.href.includes(PATHS.SHARED_LISTS.VIEWER.RELATIVE);

    switch (currentQuestionnaire) {
      case QuestionnaireType.PERSONA:
        trackPersonaQ1Completed(userPersona.persona);
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.PERSONA, userPersona.persona);
        break;
    }

    if (isSurveyModal || index !== surveyLength - 1) {
      handleSurveyNavigation(currentPage, dispatch);

      if (isSurveyModal && index === surveyLength - 1) {
        if (isSharedListUser || appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) {
          //don’t show recommendation screen for shared list users or desktop users
          dispatch(actions.updateIsPersonaSurveyCompleted(true));
          return;
        }
        dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal", newValue: false }));
      }
    } else {
      callback?.();
    }
  }, [appMode, dispatch, callback, currentPage, isSurveyModal, userPersona.persona]);

  const shuffledQuestionnaire = useMemo(() => {
    if (currentPage === SurveyPage.RECOMMENDATIONS || currentPage === SurveyPage.GETTING_STARTED) return;
    const options = OptionsConfig[currentPage]?.options;
    return shuffleOptions(options);
  }, [currentPage]);

  const renderOptions = useCallback(
    (options: Option[], questionnaire: QuestionnaireType) => {
      return (
        <div className="survey-options-container">
          {options.map((option: Option, index: number) => (
            <SurveyOption
              key={index}
              option={option}
              action={OptionsConfig[questionnaire].questionResponseAction}
              questionnaire={questionnaire}
              moveToNextPage={handleMoveToNextPage}
            />
          ))}
        </div>
      );
    },
    [handleMoveToNextPage]
  );

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
          dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal", newValue: true }));
        }
      });
    }
  }, [appMode, currentPage, dispatch, navigate, isSurveyModal]);

  useEffect(() => {
    if (isSurveyModal && currentPage === SurveyPage.GETTING_STARTED) {
      shouldShowOnboarding(appMode).then((result) => {
        if (result) {
          if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) trackPersonaSurveyViewed();
        }
      });
    }
  }, [appMode, currentPage, isSurveyModal]);

  useEffect(() => {
    if (!(currentPage in SurveyConfig)) {
      if (isSurveyModal) {
        if (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP) dispatch(actions.updateIsPersonaSurveyCompleted(true));
        else dispatch(actions.updatePersonaSurveyPage(SurveyPage.RECOMMENDATIONS));
      } else callback?.();
    }
  }, [currentPage, dispatch, callback, isSurveyModal, appMode]);

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
            <SurveyModalFooter currentPage={currentPage} moveToNextPage={handleMoveToNextPage} />
          </div>
        </RQModal>
      ) : (
        <div className="persona-survey-container">
          {surveyPages}
          <SurveyModalFooter currentPage={currentPage} moveToNextPage={handleMoveToNextPage} />
        </div>
      )}
    </>
  );
};
