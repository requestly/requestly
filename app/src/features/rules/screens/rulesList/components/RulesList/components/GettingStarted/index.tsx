import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Divider, Tooltip } from "antd";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import CharlesIcon from "assets/icons/charlesIcon.svg?react";
import ModheaderIcon from "assets/icons/modheaderIcon.svg?react";
import { ImportFromCharlesModal } from "../ImporterComponents/CharlesImporter";
import { ImportRulesModal } from "../../../../../../modals/ImportRulesModal";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import APP_CONSTANTS from "config/constants";
import { SOURCE } from "modules/analytics/events/common/constants";
import { getUserAuthDetails, getAppMode, getUserPersonaSurveyDetails } from "store/selectors";
import PersonaRecommendation from "./PersonaRecommendation";
import { shouldShowRecommendationScreen } from "features/personaSurvey/utils";
import { trackGettingStartedVideoPlayed, trackRulesEmptyStateClicked } from "modules/analytics/events/common/rules";
import {
  trackRulesImportStarted,
  trackUploadRulesButtonClicked,
  trackCharlesSettingsImportStarted,
} from "modules/analytics/events/features/rules";
import { ImportFromModheaderModal } from "../ImporterComponents/ModheaderImporter/ImportFromModheaderModal";
import emptyInbox from "./empty-inbox.svg";
import { MdOutlineAddCircleOutline } from "@react-icons/all-files/md/MdOutlineAddCircleOutline";
import { MdOutlineHelpOutline } from "@react-icons/all-files/md/MdOutlineHelpOutline";
import { MdOutlineFileUpload } from "@react-icons/all-files/md/MdOutlineFileUpload";
import { HiOutlineTemplate } from "@react-icons/all-files/hi/HiOutlineTemplate";
import { RuleType } from "types";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { RuleSelectionListDrawer } from "../RuleSelectionListDrawer/RuleSelectionListDrawer";
import "./gettingStarted.scss";

const { PATHS } = APP_CONSTANTS;

export const GettingStarted: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const userPersona = useSelector(getUserPersonaSurveyDetails);
  const gettingStartedVideo = useRef(null);
  const [isImportRulesModalActive, setIsImportRulesModalActive] = useState(false);
  const [isImportCharlesRulesModalActive, setIsImportCharlesRulesModalActive] = useState(false);
  const [isImportModheaderRulesModalActive, setIsImportModheaderRulesModalActive] = useState(false);
  const [isRulesListDrawerOpen, setIsRulesListDrawerOpen] = useState(false);

  const onRulesListDrawerClose = () => {
    setIsRulesListDrawerOpen(false);
  };

  const isCharlesImportFeatureFlagOn = useFeatureIsOn("import_rules_from_charles");

  const isRecommendationScreenVisible = useMemo(
    () => shouldShowRecommendationScreen(userPersona, appMode, state?.src),
    [appMode, state?.src, userPersona]
  );

  const toggleImportRulesModal = () => {
    setIsImportRulesModalActive((prev) => !prev);
  };
  const toggleImportCharlesRulesModal = () => {
    setIsImportCharlesRulesModalActive((prev) => !prev);
  };
  const toggleImportModheaderRulesModal = () => {
    setIsImportModheaderRulesModalActive((prev) => !prev);
  };

  const handleNewRuleClick = (source: string) => {
    trackRulesEmptyStateClicked(source);
    setIsRulesListDrawerOpen(true);
  };

  const handleUploadRulesClick = () => {
    setIsImportRulesModalActive(true);
    trackRulesImportStarted();
  };

  useEffect(() => {
    if (gettingStartedVideo.current) {
      gettingStartedVideo.current.addEventListener("play", () => {
        trackGettingStartedVideoPlayed();
      });
    }
  }, []);

  if (isRecommendationScreenVisible) {
    return <PersonaRecommendation handleUploadRulesClick={handleUploadRulesClick} />;
  }

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
      <div className="getting-started-container">
        <div className="getting-started-content">
          <div className="create-new-rule-container">
            <div className="create-new-rule-title">Create new rule</div>
            <div className="create-new-rule-content">
              <div className="no-rules">
                <div className="empty-rules-image-container">
                  <img width={72} height={72} src={emptyInbox} alt="empty-rules" className="empty-rules" />
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
                    View all rules
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

            {/* TODO: make desktop only */}
            {isCharlesImportFeatureFlagOn ? (
              <>
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
              </>
            ) : null}

            <Button
              type="link"
              className="link-btn templates-btn"
              icon={<HiOutlineTemplate className="anticon" />}
              onClick={() => {
                trackRulesEmptyStateClicked("templates");
                navigate(PATHS.RULES.TEMPLATES.ABSOLUTE);
              }}
            >
              Start with templates
            </Button>
          </div>

          {/* <div className="ask-ai-container">
            <div className="title">Ask AI for any help with using Requestly</div>

            <div>
              <div
                className="ask-ai"
                onClick={() => {
                  trackRulesEmptyStateClicked("ai_bot");
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <g clip-path="url(#clip0_2119_2251)">
                    <path
                      d="M12.3329 6.83927C12.3329 6.86905 12.3323 6.8986 12.3309 6.92794C12.1428 6.76099 11.8998 6.66894 11.6483 6.66927C11.5403 6.66927 11.4352 6.68572 11.3329 6.7186V3.83594C11.3329 3.70333 11.2803 3.57615 11.1865 3.48238C11.0927 3.38862 10.9656 3.33594 10.8329 3.33594H5.16628C5.03367 3.33594 4.90649 3.38862 4.81272 3.48238C4.71896 3.57615 4.66628 3.70333 4.66628 3.83594V6.83927C4.66628 7.11527 4.89028 7.33927 5.16628 7.33927H10.6836L10.6769 7.35594L10.6749 7.36394L10.3749 8.2866L10.3683 8.30394L10.3556 8.33927H5.16628C4.76845 8.33927 4.38692 8.18124 4.10562 7.89993C3.82431 7.61863 3.66628 7.2371 3.66628 6.83927V3.83594C3.66628 3.43811 3.82431 3.05658 4.10562 2.77528C4.38692 2.49397 4.76845 2.33594 5.16628 2.33594H7.49961V1.83594C7.49964 1.71501 7.54349 1.59819 7.62304 1.50712C7.70259 1.41605 7.81245 1.35689 7.93228 1.3406L7.99961 1.33594C8.12054 1.33596 8.23736 1.37981 8.32843 1.45937C8.4195 1.53892 8.47866 1.64878 8.49495 1.7686L8.49961 1.83594L8.49894 2.33594H10.8323C11.2301 2.33594 11.6116 2.49397 11.8929 2.77528C12.1742 3.05658 12.3323 3.43811 12.3323 3.83594L12.3329 6.83927ZM8.69495 9.35994L8.76961 9.33594H4.16895C3.77112 9.33594 3.38959 9.49397 3.10828 9.77528C2.82698 10.0566 2.66895 10.4381 2.66895 10.8359V11.4406C2.66888 11.8006 2.74658 12.1564 2.89674 12.4837C3.04689 12.8109 3.26596 13.1019 3.53895 13.3366C4.58095 14.2319 6.07361 14.6699 7.99961 14.6699C9.38361 14.6699 10.5443 14.4439 11.4749 13.9846C11.298 13.9507 11.133 13.8712 10.9963 13.7539C10.8596 13.6366 10.756 13.4856 10.6956 13.3159L10.6929 13.3079L10.6729 13.2459C9.94895 13.5273 9.05961 13.6699 7.99961 13.6699C6.29361 13.6699 5.02961 13.2993 4.19095 12.5779C4.02719 12.4371 3.89577 12.2626 3.80568 12.0663C3.71558 11.87 3.66894 11.6566 3.66895 11.4406V10.8359C3.66895 10.7033 3.72162 10.5762 3.81539 10.4824C3.90916 10.3886 4.03634 10.3359 4.16895 10.3359H7.99961V10.3339C7.99926 10.1208 8.06524 9.91287 8.1884 9.73893C8.31156 9.565 8.4858 9.43371 8.68695 9.36327L8.69495 9.35994ZM7.33228 5.16927C7.33543 5.0579 7.31621 4.94702 7.27577 4.8432C7.23532 4.73938 7.17447 4.64473 7.09681 4.56484C7.01915 4.48495 6.92625 4.42144 6.82362 4.37808C6.72098 4.33471 6.6107 4.31237 6.49928 4.31237C6.38786 4.31237 6.27757 4.33471 6.17494 4.37808C6.07231 4.42144 5.97941 4.48495 5.90175 4.56484C5.82409 4.64473 5.76323 4.73938 5.72279 4.8432C5.68234 4.94702 5.66313 5.0579 5.66628 5.16927C5.67241 5.38612 5.76287 5.59202 5.91842 5.74323C6.07396 5.89444 6.28235 5.97904 6.49928 5.97904C6.71621 5.97904 6.92459 5.89444 7.08014 5.74323C7.23569 5.59202 7.32614 5.38612 7.33228 5.16927ZM9.49428 4.33594C9.60565 4.33279 9.71653 4.352 9.82035 4.39245C9.92416 4.43289 10.0188 4.49374 10.0987 4.57141C10.1786 4.64907 10.2421 4.74197 10.2855 4.8446C10.3288 4.94723 10.3512 5.05752 10.3512 5.16894C10.3512 5.28036 10.3288 5.39064 10.2855 5.49328C10.2421 5.59591 10.1786 5.6888 10.0987 5.76647C10.0188 5.84413 9.92416 5.90498 9.82035 5.94543C9.71653 5.98587 9.60565 6.00509 9.49428 6.00194C9.27743 5.9958 9.07153 5.90535 8.92032 5.7498C8.76911 5.59425 8.68451 5.38587 8.68451 5.16894C8.68451 4.952 8.76911 4.74362 8.92032 4.58807C9.07153 4.43253 9.27743 4.34207 9.49428 4.33594ZM10.7256 11.6106C10.496 11.3137 10.1832 11.0921 9.82695 10.9739L8.90895 10.6753C8.83842 10.6502 8.77738 10.6038 8.73422 10.5427C8.69107 10.4815 8.6679 10.4085 8.6679 10.3336C8.6679 10.2587 8.69107 10.1857 8.73422 10.1245C8.77738 10.0634 8.83842 10.017 8.90895 9.99194L9.82695 9.69327C10.0989 9.59948 10.3459 9.44495 10.5492 9.24141C10.7525 9.03787 10.9068 8.79068 11.0003 8.5186L11.0069 8.49594L11.3063 7.57794C11.3312 7.50718 11.3775 7.4459 11.4388 7.40256C11.5001 7.35922 11.5732 7.33595 11.6483 7.33595C11.7233 7.33595 11.7965 7.35922 11.8578 7.40256C11.919 7.4459 11.9653 7.50718 11.9903 7.57794L12.2889 8.49594C12.382 8.77489 12.5388 9.02833 12.7469 9.23616C12.9549 9.44399 13.2086 9.60049 13.4876 9.69327L14.4063 9.99194L14.4243 9.9966C14.4948 10.0217 14.5558 10.068 14.599 10.1292C14.6422 10.1904 14.6653 10.2634 14.6653 10.3383C14.6653 10.4131 14.6422 10.4862 14.599 10.5473C14.5558 10.6085 14.4948 10.6548 14.4243 10.6799L13.5056 10.9786C13.2266 11.0714 12.9729 11.2279 12.7649 11.4357C12.5568 11.6435 12.4 11.897 12.3069 12.1759L12.0089 13.0939C11.9835 13.1647 11.937 13.2259 11.8756 13.2693C11.8298 13.3016 11.7772 13.3229 11.7218 13.3315C11.6664 13.3401 11.6098 13.3357 11.5563 13.3188C11.5029 13.3018 11.4541 13.2726 11.4139 13.2336C11.3736 13.1946 11.3429 13.1468 11.3243 13.0939L11.0256 12.1759C10.9589 11.9716 10.8574 11.7804 10.7256 11.6106ZM15.8549 14.1446L15.3449 13.9793C15.1899 13.9276 15.0491 13.8406 14.9335 13.7251C14.8179 13.6097 14.7307 13.4689 14.6789 13.3139L14.5129 12.8039C14.4991 12.7646 14.4734 12.7304 14.4394 12.7063C14.4054 12.6822 14.3647 12.6692 14.3229 12.6692C14.2812 12.6692 14.2405 12.6822 14.2065 12.7063C14.1724 12.7304 14.1467 12.7646 14.1329 12.8039L13.9669 13.3133C13.9163 13.4672 13.8308 13.6074 13.7172 13.7229C13.6035 13.8384 13.4647 13.9262 13.3116 13.9793L12.8009 14.1446C12.7616 14.1584 12.7274 14.1841 12.7033 14.2181C12.6792 14.2522 12.6662 14.2929 12.6662 14.3346C12.6662 14.3763 12.6792 14.417 12.7033 14.4511C12.7274 14.4851 12.7616 14.5108 12.8009 14.5246L13.3116 14.6906C13.4669 14.7425 13.608 14.8299 13.7236 14.9459C13.8392 15.0618 13.9262 15.2032 13.9776 15.3586L14.1429 15.8679C14.1571 15.907 14.1829 15.9408 14.2169 15.9647C14.2509 15.9885 14.2914 16.0014 14.3329 16.0014C14.3745 16.0014 14.415 15.9885 14.449 15.9647C14.483 15.9408 14.5088 15.907 14.5229 15.8679L14.6896 15.3586C14.7413 15.2036 14.8283 15.0627 14.9437 14.9471C15.0592 14.8316 15.2 14.7444 15.3549 14.6926L15.8656 14.5273C15.905 14.5135 15.9391 14.4878 15.9632 14.4537C15.9874 14.4197 16.0003 14.379 16.0003 14.3373C16.0003 14.2955 15.9874 14.2548 15.9632 14.2208C15.9391 14.1868 15.905 14.1611 15.8656 14.1473L15.8549 14.1446Z"
                      fill="#BCBCBC"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2119_2251">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>{" "}
                e.g. How can I insert custom CSS code on a web page?
              </div>
              <div className="caption">Interact with our AI bot to get instant answers to your questions.</div>
            </div>
          </div> */}
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

      {isImportRulesModalActive ? (
        <ImportRulesModal isOpen={isImportRulesModalActive} toggle={toggleImportRulesModal} />
      ) : null}
    </>
  );
};
