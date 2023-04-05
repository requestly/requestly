import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Route,
  Routes,
  Navigate,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
//FOR ROUTER
import routes from "../../routes";
//SUB COMPONENTS
import SpinnerModal from "components/misc/SpinnerModal";
import AuthModal from "components/authentication/AuthModal";
//CONSTANTS
import APP_CONSTANTS from "config/constants";
import { actions } from "store";
//UTILS
import { getActiveModals, getUserPersonaSurveyDetails } from "store/selectors";
import { getRouteFromCurrentPath } from "utils/URLUtils";
import ExtensionModal from "components/user/ExtensionModal/index.js";
import FreeTrialExpiredModal from "../../components/landing/pricing/FreeTrialExpiredModal";
import SyncConsentModal from "../../components/user/SyncConsentModal";
import { trackPageViewEvent } from "modules/analytics/events/misc/pageView";
import { PersonaSurveyModal } from "components/misc/PersonaSurvey";
import ImportRulesModal from "components/features/rules/ImportRulesModal";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
const { PATHS } = APP_CONSTANTS;

const DashboardContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPersonaRecommendationFlagOn = useFeatureIsOn(
    "persona_recommendation"
  );

  //Global state
  const dispatch = useDispatch();
  const activeModals = useSelector(getActiveModals);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(
    false
  );

  const toggleSpinnerModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "loadingModal" }));
  };
  const toggleAuthModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "authModal" }));
  };
  const toggleExtensionModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "extensionModal" }));
  };
  const toggleSyncConsentModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "syncConsentModal" }));
  };
  const togglePersonaSurveyModal = useCallback(() => {
    dispatch(actions.toggleActiveModal({ modalName: "personaSurveyModal" }));
  }, [dispatch]);

  const toggleImportRulesModal = () => {
    setIsImportRulesModalActive(isImportRulesModalActive ? false : true);
  };

  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const prevProps = usePrevious({ location });

  useEffect(() => {
    if (
      isPersonaRecommendationFlagOn &&
      userPersona.page === 1 &&
      userPersona.isSurveyCompleted === false
    ) {
      navigate(PATHS.GETTING_STARTED, {
        replace: true,
        state: {
          src: "persona_survey_modal",
          redirectTo:
            location.state?.redirectTo ?? PATHS.RULES.MY_RULES.ABSOLUTE,
        },
      });
    }
  }, [
    navigate,
    location.state?.redirectTo,
    userPersona.page,
    userPersona.isSurveyCompleted,
    isPersonaRecommendationFlagOn,
  ]);

  useEffect(() => {
    if (prevProps && prevProps.location !== location) {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      document.getElementById("dashboardMainContent").scrollTop = 0;
    }

    // ANALYTICS
    if (!prevProps || prevProps.location !== location) {
      trackPageViewEvent(
        getRouteFromCurrentPath(location.pathname),
        Object.fromEntries(searchParams)
      );
    }
  }, [location, prevProps, searchParams]);

  const getRoutes = (routes) => {
    return routes.map((route, key) => {
      const propsFromRoute = route.props || {};
      return (
        <Route
          path={"/".concat(route.path).replace(/\/\//g, "/")}
          key={key}
          element={
            <route.component location={window.location} {...propsFromRoute} />
          }
        />
      );
    });
  };

  return (
    <>
      <div id="dashboardMainContent">
        <Routes>
          {getRoutes(routes)}
          <Route
            path={PATHS.ROOT}
            element={<Navigate to={PATHS.RULES.ABSOLUTE} />}
          />
          <Route
            path={PATHS.INDEX_HTML}
            element={<Navigate to={PATHS.RULES.ABSOLUTE} />}
          />
          <Route
            path={PATHS.FEEDBACK.ABSOLUTE}
            element={<Navigate to={PATHS.FEEDBACK.ABSOLUTE} />}
          />
          <Route
            path={PATHS.HOME.ABSOLUTE}
            element={<Navigate to={PATHS.HOME.ABSOLUTE} />}
          />
          {/* <Route
            path={PATHS.RULES.ABSOLUTE}
            element={
              <Navigate
                to={<ProtectedRoute component={<RulesIndexView />} />}
              />
            }
          /> */}

          {/** SUPPORT LEGACY URLS */}
          <Route
            path={PATHS.LEGACY.FILES_LIBRARY.ABSOLUTE + "/:id"}
            element={<Navigate to={PATHS.FILES.VIEWER.ABSOLUTE + "/:id"} />}
          />
          <Route
            path={PATHS.LEGACY.PRICING.ABSOLUTE}
            element={<Navigate to={PATHS.PRICING.ABSOLUTE} />}
          />
          <Route
            path={PATHS.LEGACY.LICENSE.MANAGE.ABSOLUTE}
            element={<Navigate to={PATHS.LICENSE.MANAGE.ABSOLUTE} />}
          />
          <Route
            path={PATHS.LEGACY.LICENSE.ABSOLUTE}
            element={<Navigate to={PATHS.LICENSE.ABSOLUTE} />}
          />
          <Route
            path={PATHS.LEGACY.SETTINGS.ABSOLUTE}
            element={<Navigate to={PATHS.SETTINGS.ABSOLUTE} />}
          />
          <Route
            path={PATHS.LEGACY.UNLOCK_PREMIUM.ABSOLUTE}
            element={<Navigate to={PATHS.UNLOCK_PREMIUM.ABSOLUTE} />}
          />
          <Route
            path={PATHS.LEGACY.GOODBYE.ABSOLUTE}
            element={<Navigate to={PATHS.GOODBYE.ABSOLUTE} />}
          />
          <Route
            path={PATHS.EXTENSION_INSTALLED.RELATIVE}
            element={<Navigate to={PATHS.EXTENSION_INSTALLED.ABSOLUTE} />}
          />
          <Route
            path={PATHS.ANY}
            element={<Navigate to={PATHS.PAGE404.ABSOLUTE} />}
          />
        </Routes>
      </div>

      {/* MODALS */}
      {activeModals.loadingModal.isActive ? (
        <SpinnerModal
          isOpen={activeModals.loadingModal.isActive}
          toggle={() => toggleSpinnerModal()}
        />
      ) : null}
      {activeModals.authModal.isActive ? (
        <AuthModal
          isOpen={activeModals.authModal.isActive}
          toggle={() => toggleAuthModal()}
          {...activeModals.authModal.props}
        />
      ) : null}
      {activeModals.extensionModal.isActive ? (
        <ExtensionModal
          isOpen={activeModals.extensionModal.isActive}
          toggle={() => toggleExtensionModal()}
          {...activeModals.extensionModal.props}
        />
      ) : null}
      {activeModals.freeTrialExpiredModal.isActive ? (
        <FreeTrialExpiredModal
          isOpen={activeModals.freeTrialExpiredModal.isActive}
          {...activeModals.freeTrialExpiredModal.props}
        />
      ) : null}
      {activeModals.syncConsentModal.isActive ? (
        <SyncConsentModal
          isOpen={activeModals.syncConsentModal.isActive}
          toggle={toggleSyncConsentModal}
          {...activeModals.syncConsentModal.props}
        />
      ) : null}
      {!userPersona.isSurveyCompleted ? (
        <PersonaSurveyModal
          isOpen={activeModals.personaSurveyModal.isActive}
          toggle={togglePersonaSurveyModal}
          toggleImportRulesModal={toggleImportRulesModal}
          {...activeModals.personaSurveyModal.props}
        />
      ) : null}

      {/* ) : null} */}
      {isImportRulesModalActive ? (
        <ImportRulesModal
          isOpen={isImportRulesModalActive}
          toggle={toggleImportRulesModal}
        />
      ) : null}
    </>
  );
};

export default DashboardContent;
