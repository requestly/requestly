import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Divider, Tooltip } from "antd";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import CharlesIcon from "assets/icons/charlesIcon.svg?react";
import ModheaderIcon from "assets/icons/modheaderIcon.svg?react";
import ResourceOverrideIcon from "assets/icons/resourceOverrideIcon.webp";
import { ImportFromCharlesModal } from "../ImporterComponents/CharlesImporter";
import { ImportRulesModal } from "../../../../../../modals/ImportRulesModal";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import {
  trackGettingStartedVideoPlayed,
  trackNewRuleButtonClicked,
  trackRulesEmptyStateClicked,
} from "modules/analytics/events/common/rules";
import {
  trackRulesImportStarted,
  trackUploadRulesButtonClicked,
  trackCharlesSettingsImportStarted,
  trackResourceOverrideSettingsImportStarted,
  trackHeaderEditorSettingsImportStarted,
} from "modules/analytics/events/features/rules";
import { ImportFromModheaderModal } from "../ImporterComponents/ModheaderImporter/ImportFromModheaderModal";
import { MdOutlineAddCircleOutline } from "@react-icons/all-files/md/MdOutlineAddCircleOutline";
import { MdOutlineHelpOutline } from "@react-icons/all-files/md/MdOutlineHelpOutline";
import { MdOutlineFileUpload } from "@react-icons/all-files/md/MdOutlineFileUpload";
import { HiOutlineTemplate } from "@react-icons/all-files/hi/HiOutlineTemplate";
import { MdInfoOutline } from "@react-icons/all-files/md/MdInfoOutline";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { RuleSelectionListDrawer } from "../RuleSelectionListDrawer/RuleSelectionListDrawer";
import { trackAskAIClicked } from "features/requestBot";
import { RQButton } from "lib/design-system/components";
import BotIcon from "assets/icons/bot.svg?react";
import { globalActions } from "store/slices/global/slice";
import { redirectToTeam } from "utils/RedirectionUtils";
import { useIsRedirectFromCreateRulesRoute } from "../../hooks/useIsRedirectFromCreateRulesRoute";
import "./gettingStarted.scss";
import { RuleType } from "@requestly/shared/types/entities/rules";
import { ImportFromResourceOverrideModal } from "../ImporterComponents/ResourceOverrideImporter";
import { ImporterType } from "components/Home/types";
import { getActiveWorkspaceId, isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { getLinkWithMetadata } from "modules/analytics/metadata";
import { HeaderEditorImporterModal } from "../ImporterComponents/HeaderEditorImporter/HeaderEditorImporterModal";

const { PATHS } = APP_CONSTANTS;

export const GettingStarted: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const gettingStartedVideo = useRef(null);
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(false);
  const [isImportCharlesRulesModalActive, setIsImportCharlesRulesModalActive] = useState(false);
  const [isImportModheaderRulesModalActive, setIsImportModheaderRulesModalActive] = useState(false);
  const [isImportResourceOverrideRulesModalActive, setIsImportResourceOverrideRulesModalActive] = useState(false);
  const [isImportHeaderEditorRulesModalActive, setIsImportHeaderEditorRulesModalActive] = useState(false);
  const isRedirectFromCreateRulesRoute = useIsRedirectFromCreateRulesRoute();
  const [isRulesListDrawerOpen, setIsRulesListDrawerOpen] = useState(isRedirectFromCreateRulesRoute || false);

  const onRulesListDrawerClose = () => {
    setIsRulesListDrawerOpen(false);
  };

  const isCharlesImportFeatureFlagOn = useFeatureIsOn("import_rules_from_charles");

  const toggleImportRulesModal = () => {
    setIsImportRulesModalActive((prev) => !prev);
  };
  const toggleImportCharlesRulesModal = () => {
    setIsImportCharlesRulesModalActive((prev) => !prev);
  };
  const toggleImportModheaderRulesModal = () => {
    setIsImportModheaderRulesModalActive((prev) => !prev);
  };
  const toggleImportResourceOverrideRulesModal = () => {
    setIsImportResourceOverrideRulesModalActive((prev) => !prev);
  };
  const toggleImportHeaderEditorRulesModal = () => {
    setIsImportHeaderEditorRulesModalActive((prev) => !prev);
  };

  const handleNewRuleClick = (source: string) => {
    trackNewRuleButtonClicked(SOURCE.GETTING_STARTED);
    trackRulesEmptyStateClicked(source);
    setIsRulesListDrawerOpen(true);
  };

  const handleUploadRulesClick = () => {
    setIsImportRulesModalActive(true);
    trackRulesImportStarted();
  };

  useEffect(() => {
    if (state?.modal) {
      switch (state?.modal) {
        case ImporterType.CHARLES:
          toggleImportCharlesRulesModal();
          break;
        case ImporterType.MOD_HEADER:
          toggleImportModheaderRulesModal();
          break;
        case ImporterType.RESOURCE_OVERRIDE:
          toggleImportResourceOverrideRulesModal();
          break;
        case ImporterType.HEADER_EDITOR:
          toggleImportHeaderEditorRulesModal();
          break;
        case ImporterType.REQUESTLY:
          handleUploadRulesClick();
          break;
        default:
          break;
      }
    }
  }, [state?.modal]);

  useEffect(() => {
    if (gettingStartedVideo.current) {
      gettingStartedVideo.current.addEventListener("play", () => {
        trackGettingStartedVideoPlayed();
      });
    }
  }, []);

  const suggestedRules = [
    {
      type: RuleType.REDIRECT,
      title: "Redirect a request",
      icon: RULE_TYPES_CONFIG[RuleType.REDIRECT].ICON,
      link: PATHS.RULE_EDITOR.CREATE_RULE.REDIRECT_RULE.ABSOLUTE,
      help: "Redirect scripts, APIs, Stylesheets, or any other resource from one environment to another.",
    },
    {
      type: RuleType.RESPONSE,
      title: "Override API response",
      icon: RULE_TYPES_CONFIG[RuleType.RESPONSE].ICON,
      link: PATHS.RULE_EDITOR.CREATE_RULE.RESPONSE_RULE.ABSOLUTE,
      help: "Stub API responses to simulate required scenarios effectively.",
    },
    {
      type: RuleType.HEADERS,
      title: "Add/Remove header",
      icon: RULE_TYPES_CONFIG[RuleType.HEADERS].ICON,
      link: PATHS.RULE_EDITOR.CREATE_RULE.HEADERS_RULE.ABSOLUTE,
      help: "Modify HTTP headers based conditionally to test frontend or backend behavior.",
    },
  ];

  return (
    <>
      <div className="v2 getting-started-container">
        <div className="getting-started-content">
          {isSharedWorkspaceMode ? (
            <div className="workspace-title-container">
              <div className="workspace-title">
                <MdInfoOutline />
                This is a shared workspace
              </div>
              <div className="lead">
                Rules created here can be accessed by your teammates. To manage your teammates{" "}
                <a
                  href={getLinkWithMetadata("https://requestly.com/")}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    redirectToTeam(navigate, activeWorkspaceId);
                  }}
                >
                  click here
                </a>
                .
              </div>
            </div>
          ) : null}

          <div className="create-new-rule-container">
            <div className="create-new-rule-title">Create new rule</div>
            <div className="create-new-rule-content">
              <div className="no-rules">
                <div className="empty-rules-image-container">
                  <img
                    width={72}
                    height={72}
                    src={"/assets/media/rules/empty-inbox.svg"}
                    alt="empty-rules"
                    className="empty-rules"
                  />
                  <div className="caption">No rules created yet</div>
                </div>

                <RuleSelectionListDrawer
                  open={isRulesListDrawerOpen}
                  onClose={onRulesListDrawerClose}
                  source={SOURCE.GETTING_STARTED}
                  onRuleItemClick={() => {
                    onRulesListDrawerClose();
                  }}
                >
                  <Button
                    block
                    type="primary"
                    onClick={() => handleNewRuleClick("new_rule")}
                    className="getting-started-create-rule-btn"
                    icon={<MdOutlineAddCircleOutline className="anticon" />}
                  >
                    New rule
                  </Button>
                </RuleSelectionListDrawer>
              </div>
              <div className="rule-suggestions">
                {suggestedRules.map(({ type, title, icon, link, help }) => {
                  return (
                    <Link
                      to={link}
                      key={type}
                      className="suggested-rule-link"
                      state={{ source: "rules_empty_state" }}
                      onClick={() => {
                        trackRulesEmptyStateClicked(type);
                      }}
                    >
                      <span className="icon">{icon()}</span>
                      <span className="title">{title}</span>
                      {help ? (
                        <Tooltip title={help}>
                          <span className="help-icon">
                            <MdOutlineHelpOutline />
                          </span>
                        </Tooltip>
                      ) : null}
                    </Link>
                  );
                })}

                <RuleSelectionListDrawer
                  open={isRulesListDrawerOpen}
                  onClose={onRulesListDrawerClose}
                  source={SOURCE.GETTING_STARTED}
                  onRuleItemClick={() => {
                    onRulesListDrawerClose();
                  }}
                >
                  <Button type="link" className="link-btn" onClick={() => handleNewRuleClick("view_all_rule_types")}>
                    View all rule types
                  </Button>
                </RuleSelectionListDrawer>
              </div>
            </div>
          </div>

          <Divider className="divider" />

          <div className="getting-started-actions">
            <AuthConfirmationPopover
              title="You need to sign up to upload rules"
              callback={handleUploadRulesClick}
              source={SOURCE.UPLOAD_RULES}
              disabled={window.isChinaUser}
            >
              <Button
                type="link"
                className="link-btn"
                icon={<MdOutlineFileUpload className="anticon" />}
                onClick={() => {
                  trackRulesEmptyStateClicked("import_json");
                  trackUploadRulesButtonClicked(SOURCE.GETTING_STARTED);
                  user?.details?.isLoggedIn && handleUploadRulesClick();
                }}
              >
                Upload rules
              </Button>
            </AuthConfirmationPopover>

            <Button
              type="link"
              className="link-btn"
              icon={<HiOutlineTemplate className="anticon" />}
              onClick={() => {
                trackRulesEmptyStateClicked("templates");
                navigate(PATHS.RULES.TEMPLATES.ABSOLUTE);
              }}
            >
              Start with templates
            </Button>

            {/* TODO: make desktop only */}
            {isCharlesImportFeatureFlagOn ? (
              <div className="third-party-imports">
                <Button
                  type="link"
                  className="link-btn"
                  icon={<CharlesIcon className="anticon" />}
                  onClick={() => {
                    toggleImportCharlesRulesModal();
                    trackRulesEmptyStateClicked("import_charles");
                    trackCharlesSettingsImportStarted(SOURCE.GETTING_STARTED);
                  }}
                >
                  Import from Charles
                </Button>

                <Button
                  type="link"
                  className="link-btn"
                  icon={<ModheaderIcon className="anticon" />}
                  onClick={() => {
                    toggleImportModheaderRulesModal();
                    trackRulesEmptyStateClicked("import_modheader");
                    trackCharlesSettingsImportStarted(SOURCE.GETTING_STARTED);
                  }}
                >
                  Import from ModHeader
                </Button>
                <Button
                  type="link"
                  className="link-btn"
                  icon={
                    <img
                      src={ResourceOverrideIcon}
                      width={11}
                      height={10}
                      alt="Resource override icon"
                      className="anticon"
                    />
                  }
                  onClick={() => {
                    toggleImportResourceOverrideRulesModal();
                    trackRulesEmptyStateClicked("import_resource_override");
                    trackResourceOverrideSettingsImportStarted(SOURCE.GETTING_STARTED);
                  }}
                >
                  Import from Resource Override
                </Button>
                <Button
                  type="link"
                  className="link-btn"
                  icon={
                    <img
                      src="/assets/img/brandLogos/header-editor-custom-icon.png"
                      width={11}
                      height={10}
                      alt="Header Editor icon"
                      className="anticon"
                    />
                  }
                  onClick={() => {
                    toggleImportHeaderEditorRulesModal();
                    trackRulesEmptyStateClicked("import_header_editor");
                    trackHeaderEditorSettingsImportStarted(SOURCE.GETTING_STARTED);
                  }}
                >
                  Import from Header Editor
                </Button>
              </div>
            ) : null}
          </div>

          <div className="ask-ai-container">
            <div className="title">Ask AI for any help with using Requestly</div>
            <div>
              <RQButton
                block
                className="ask-ai-btn"
                onClick={() => {
                  trackAskAIClicked("rules_empty_state");
                  trackRulesEmptyStateClicked("ai_bot");
                  dispatch(globalActions.updateRequestBot({ isActive: true, modelType: "app" }));
                }}
              >
                <div className="ask-ai-btn-content">
                  <BotIcon />
                  e.g. How can I insert custom CSS code on a web page?
                </div>
              </RQButton>
            </div>
          </div>
        </div>
      </div>

      {isImportCharlesRulesModalActive ? (
        <ImportFromCharlesModal
          isOpen={isImportCharlesRulesModalActive}
          toggle={toggleImportCharlesRulesModal}
          triggeredBy={SOURCE.GETTING_STARTED}
        />
      ) : null}

      {isImportModheaderRulesModalActive ? (
        <ImportFromModheaderModal
          isOpen={isImportModheaderRulesModalActive}
          toggle={toggleImportModheaderRulesModal}
          triggeredBy={SOURCE.GETTING_STARTED}
        />
      ) : null}
      {isImportResourceOverrideRulesModalActive ? (
        <ImportFromResourceOverrideModal
          isOpen={isImportResourceOverrideRulesModalActive}
          toggle={toggleImportResourceOverrideRulesModal}
          triggeredBy={SOURCE.GETTING_STARTED}
        />
      ) : null}

      {isImportHeaderEditorRulesModalActive ? (
        <HeaderEditorImporterModal
          isOpen={isImportHeaderEditorRulesModalActive}
          toggle={toggleImportHeaderEditorRulesModal}
          triggeredBy={SOURCE.GETTING_STARTED}
        />
      ) : null}

      {isImportRulesModalActive ? (
        <ImportRulesModal isOpen={isImportRulesModalActive} toggle={toggleImportRulesModal} />
      ) : null}
    </>
  );
};
