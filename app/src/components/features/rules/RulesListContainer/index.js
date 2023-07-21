import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProCard from "@ant-design/pro-card";
import { actions } from "../../../../store";
//Sub Components
import CreateNewRuleGroupModal from "../CreateNewRuleGroupModal";
import ExportRulesModal from "../ExportRulesModal";
import DeleteRulesModal from "../DeleteRulesModal";
import ImportRulesModal from "../ImportRulesModal";
import ChangeRuleGroupModal from "../ChangeRuleGroupModal";
import RenameGroupModal from "../RenameGroupModal";
import CreateSharedListModal from "../../sharedLists/CreateSharedListModal";
import {
  getRulesSelection,
  getUserAuthDetails,
  getAllRules,
  getActiveModals,
  getAppMode,
} from "../../../../store/selectors";
import { submitAttrUtil, trackRQLastActivity } from "../../../../utils/AnalyticsUtils";
import { isSignUpRequired } from "utils/AuthUtils";
//ACTIONS
import { getSelectedRules } from "../actions";
import { fetchSharedLists } from "../../sharedLists/SharedListsIndexPage/actions";
//CONSTANTS
import APP_CONSTANTS from "../../../../config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import RulesTable from "./RulesTable";
import "./RulesListContainer.css";
import {
  trackNewRuleButtonClicked,
  trackRuleCreationWorkflowStartedEvent,
} from "modules/analytics/events/common/rules";
import { trackRulesImportStarted, trackUploadRulesButtonClicked } from "modules/analytics/events/features/rules";
import { redirectToCreateNewRule } from "utils/RedirectionUtils";

const { PATHS } = APP_CONSTANTS;

const RulesListContainer = ({ isTableLoading = false }) => {
  const navigate = useNavigate();

  //Global State
  const dispatch = useDispatch();
  const rulesSelection = useSelector(getRulesSelection);
  const user = useSelector(getUserAuthDetails);
  const allRules = useSelector(getAllRules);
  const appMode = useSelector(getAppMode);
  const activeModals = useSelector(getActiveModals);
  const availableRuleTypeArray = Object.values(GLOBAL_CONSTANTS.RULE_TYPES);

  //Component State
  const [selectedRules, setSelectedRules] = useState(getSelectedRules(rulesSelection));
  const [search, setSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  //RULES COUNT OF USER TO DISPLAY ON TOP
  const [totalRulesCount, setTotalRulesCount] = useState(0);

  //TO HANDLE MOBILE VIEW
  const [isMobile, setIsMobile] = useState(false);

  //Modals
  const [isCreateNewRuleGroupModalActive, setIsCreateNewRuleGroupModalActive] = useState(false);
  const [isChangeGroupModalActive, setIsChangeGroupModalActive] = useState(false);
  const [isExportRulesModalActive, setIsExportRulesModalActive] = useState(false);
  const [isDeleteRulesModalActive, setIsDeleteRulesModalActive] = useState(false);
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(false);
  const [isShareRulesModalActive, setIsShareRulesModalActive] = useState(false);

  const toggleCreateNewRuleGroupModal = () => {
    setIsCreateNewRuleGroupModalActive(isCreateNewRuleGroupModalActive ? false : true);
  };
  const toggleChangeGroupModal = () => {
    setIsChangeGroupModalActive(isChangeGroupModalActive ? false : true);
  };
  const toggleExportRulesModal = () => {
    setIsExportRulesModalActive(isExportRulesModalActive ? false : true);
  };
  const toggleDeleteRulesModal = () => {
    // isDeleteRulesModalActive
    setIsDeleteRulesModalActive(isDeleteRulesModalActive ? false : true);
  };
  const toggleImportRulesModal = () => {
    setIsImportRulesModalActive(isImportRulesModalActive ? false : true);
  };
  const toggleShareRulesModal = () => {
    setIsShareRulesModalActive(isShareRulesModalActive ? false : true);
  };

  const toggleRenameGroupModal = () => {
    dispatch(actions.toggleActiveModal({ modalName: "renameGroupModal" }));
  };

  const promptUserToSignup = (
    callback = () => navigate(PATHS.RULES.CREATE),
    message = "Sign up to continue",
    source
  ) => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          src: APP_CONSTANTS.FEATURES.RULES,
          callback,
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          userActionMessage: message,
          eventSource: source,
        },
      })
    );
  };

  const promptUserToLogInWithoutCallback = (source) => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          src: APP_CONSTANTS.FEATURES.RULES,
          userActionMessage: "Sign up to generate a public shareable link",
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          eventSource: source,
        },
      })
    );
  };

  const handleNewRuleOnClick = async (_e, ruleType) => {
    if (ruleType) trackRuleCreationWorkflowStartedEvent(ruleType, "screen");
    else trackNewRuleButtonClicked();
    if (!user.loggedIn) {
      if (await isSignUpRequired(allRules, appMode, user)) {
        promptUserToSignup(() => redirectToCreateNewRule(navigate, ruleType, "my_rules"));
        return;
      }
    }
    redirectToCreateNewRule(navigate, ruleType, "my_rules");
    return;
  };

  const handleShareRulesOnClick = () => {
    user.loggedIn ? verifySharedListsLimit() : promptUserToLogInWithoutCallback(AUTH.SOURCE.SHARE_RULES);
  };

  const getCurrentSharedListsCount = (result) => {
    if (result) {
      return Object.keys(result).length;
    } else {
      return 0;
    }
  };

  const verifySharedListsLimit = () => {
    //Continue creating new shared list
    setSelectedRules(getSelectedRules(rulesSelection));
    setIsShareRulesModalActive(true);
    trackRQLastActivity("sharedList_created");
  };

  const handleImportRulesOnClick = (e) => {
    trackUploadRulesButtonClicked(AUTH.SOURCE.RULES_LIST);
    trackRulesImportStarted();
    verifyImportRulesLimitAndContinue();
  };

  const verifyImportRulesLimitAndContinue = () => {
    setIsImportRulesModalActive(true);
  };

  const handleExportRulesOnClick = () => {
    verifyExportRulesLimitAndContinue();
  };

  const verifyExportRulesLimitAndContinue = () => {
    setSelectedRules(getSelectedRules(rulesSelection));
    setIsExportRulesModalActive(true);
  };

  //TO SET MOBILE VIEW WIDTH BY CHECKING THROUGH WINDOW OBJECT
  const updateWidth = () => setIsMobile(window.innerWidth < 620);
  window.clearRulesSelection = false;

  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isMobile]);

  //TO SUBMIT ATTRIBUTE OF TYPES OF RULES MADE BY USER AS USER ATTRIBUTES IN FIREBASE
  useEffect(() => {
    availableRuleTypeArray.forEach((ruleType) => {
      const thatRuleTypeUserRulesArray = allRules.filter((rule) => rule.ruleType === ruleType);
      //TO SUBMIT NO OF TYPE THAT RULE ON FIREBASE ATTRIBUTES
      submitAttrUtil(ruleType + "_rules", thatRuleTypeUserRulesArray.length);
    });

    /* To set initial sharedlist count of user when it
    continuous login again from another account to not
    get false status on onboarding page */

    if (user && user.details && user.details.profile) {
      fetchSharedLists(user.details.profile.uid).then((result) => {
        const currentSharedListsCount = getCurrentSharedListsCount(result);
        submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_SHARED_LISTS, currentSharedListsCount);
        if (currentSharedListsCount > 0) {
          submitAttrUtil("iscreatesharedlisttask", true);
        }
      });
    } else {
      submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_SHARED_LISTS, 0);
      submitAttrUtil("iscreatesharedlisttask", false);
    }
  }, [allRules, availableRuleTypeArray, user]);

  //TO SET COUNT OF RULES MADE BY USER TO DISPLAY ON TOP OF RULES PAGE
  useEffect(() => {
    setTotalRulesCount(allRules.length);
  }, [allRules]);

  const recordsToDelete = allRules.filter((rule) => selectedRules.some((ruleId) => ruleId === rule.id));

  const clearSearch = useCallback(() => {
    setSearch(false);
    setSearchValue("");
  }, []);

  return (
    <>
      {/* Page content */}

      {/* Table */}
      <ProCard title={null} className="rules-table-container rules-list-container">
        <RulesTable
          search={search}
          setSearch={setSearch}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          clearSearch={clearSearch}
          isTableLoading={isTableLoading}
          handleChangeGroupOnClick={() => {
            setSelectedRules(getSelectedRules(rulesSelection));
            setIsChangeGroupModalActive(true);
          }}
          handleShareRulesOnClick={handleShareRulesOnClick}
          handleExportRulesOnClick={handleExportRulesOnClick}
          handleDeleteRulesOnClick={() => {
            setSelectedRules(getSelectedRules(rulesSelection));
            setIsDeleteRulesModalActive(true);
          }}
          handleImportRulesOnClick={handleImportRulesOnClick}
          totalRulesCount={totalRulesCount}
          handleNewGroupOnClick={() => {
            setSelectedRules(getSelectedRules(rulesSelection));
            setIsCreateNewRuleGroupModalActive(true);
          }}
          handleNewRuleOnClick={handleNewRuleOnClick}
          options={{
            disableSelection: false,
            disableEditing: false,
            disableActions: false,
            disableFavourites: false,
            disableStatus: false,
            disableAlertActions: false,
            hideLastModifiedBy: false,
            hideCreatedBy: false,
          }}
        />
      </ProCard>

      {/* Modals */}
      {isCreateNewRuleGroupModalActive ? (
        <CreateNewRuleGroupModal isOpen={isCreateNewRuleGroupModalActive} toggle={toggleCreateNewRuleGroupModal} />
      ) : null}

      {isChangeGroupModalActive ? (
        <ChangeRuleGroupModal
          clearSearch={clearSearch}
          isOpen={isChangeGroupModalActive}
          toggle={toggleChangeGroupModal}
          mode="SELECTED_RULES"
        />
      ) : null}

      {isExportRulesModalActive ? (
        <ExportRulesModal
          isOpen={isExportRulesModalActive}
          toggle={toggleExportRulesModal}
          rulesToExport={selectedRules}
        />
      ) : null}
      {isDeleteRulesModalActive ? (
        <DeleteRulesModal
          isOpen={isDeleteRulesModalActive}
          toggle={toggleDeleteRulesModal}
          ruleIdsToDelete={selectedRules}
          recordsToDelete={recordsToDelete}
          clearSearch={clearSearch}
        />
      ) : null}
      {isImportRulesModalActive ? (
        <ImportRulesModal isOpen={isImportRulesModalActive} toggle={toggleImportRulesModal} />
      ) : null}
      {isShareRulesModalActive ? (
        <CreateSharedListModal
          isOpen={isShareRulesModalActive}
          toggle={toggleShareRulesModal}
          rulesToShare={selectedRules}
        />
      ) : null}

      {activeModals.renameGroupModal.isActive ? (
        <RenameGroupModal
          isOpen={activeModals.renameGroupModal.isActive}
          toggle={toggleRenameGroupModal}
          {...activeModals.renameGroupModal.props}
        />
      ) : null}
    </>
  );
};

export default RulesListContainer;
