import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFeatureValue } from "@growthbook/growthbook-react";
import {
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  PushpinOutlined,
  PushpinFilled,
  UngroupOutlined,
  UsergroupAddOutlined,
  GroupOutlined,
  SearchOutlined,
  DownOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import ProTable from "@ant-design/pro-table";
import { Space, Tooltip, Button, Switch, Input, Empty, Dropdown, Menu } from "antd";
import APP_CONSTANTS from "config/constants";
import {
  getAllGroups,
  getAllRules,
  getAppMode,
  getGroupwiseRulesToPopulate,
  getIsRefreshRulesPending,
  getRulesSearchKeyword,
  getRulesSelection,
  getRulesToPopulate,
  getUserAuthDetails,
  getUserAttributes,
  getIsMiscTourCompleted,
} from "store/selectors";
import { getCurrentlyActiveWorkspace, getIsWorkspaceMode } from "store/features/teams/selectors";
import { Typography, Tag } from "antd";
import Text from "antd/lib/typography/Text";
import { getSelectedRules, unselectAllRules } from "../../actions";
import { deleteGroup, ungroupSelectedRules, updateRulesListRefreshPendingStatus } from "./actions";
import { actions } from "store";
import { redirectToRuleEditor } from "utils/RedirectionUtils";
import { compareRuleByModificationDate, isDesktopOnlyRule } from "utils/rules/misc";
import { isFeatureCompatible } from "../../../../../utils/CompatibilityUtils";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import SharedListRuleViewerModal from "../../SharedListRuleViewerModal";
import { isEmpty } from "lodash";
import moment from "moment";
import { StorageService } from "init";
import { toast } from "utils/Toast.js";
import { InfoTag } from "components/misc/InfoTag";
import ReactHoverObserver from "react-hover-observer";
import { UserIcon } from "components/common/UserIcon";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import { fetchSharedLists } from "components/features/sharedLists/SharedListsIndexPage/actions";
import CreateSharedListModal from "components/features/sharedLists/CreateSharedListModal";
import { AuthConfirmationPopover } from "components/hoc/auth/AuthConfirmationPopover";
import FEATURES from "config/constants/sub/features";
import DeleteRulesModal from "../../DeleteRulesModal";
import UngroupOrDeleteRulesModal from "../../UngroupOrDeleteRulesModal";
import DuplicateRuleModal from "../../DuplicateRuleModal";
import { trackGroupDeleted, trackGroupStatusToggled } from "modules/analytics/events/common/groups";
import { trackUploadRulesButtonClicked } from "modules/analytics/events/features/rules";
import {
  trackRuleActivatedStatusEvent,
  trackRuleDeactivatedStatus,
  trackRulePinToggled,
  trackRulesUngrouped,
} from "modules/analytics/events/common/rules";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { AUTH } from "modules/analytics/events/common/constants";
import RuleTypeTag from "components/common/RuleTypeTag";
import LINKS from "config/constants/sub/links";
import { MISC_TOURS, TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import Logger from "lib/logger";
import "./rulesTable.css";

//Lodash
const set = require("lodash/set");
const get = require("lodash/get");

const { Link } = Typography;

//Constants
const { RULES_LIST_TABLE_CONSTANTS } = APP_CONSTANTS;
const GROUP_DETAILS = RULES_LIST_TABLE_CONSTANTS.GROUP_DETAILS;
const GROUP_RULES = RULES_LIST_TABLE_CONSTANTS.GROUP_RULES;
const UNGROUPED_GROUP_ID = RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID;
const UNGROUPED_GROUP_NAME = RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_NAME;

const isGroupSwitchDisabled = (record, groupwiseRulesToPopulate) => {
  // UNGROUPED is not really a group
  if (record.groupId === UNGROUPED_GROUP_ID) return false;

  if (!record.groupId) return false;
  if (!groupwiseRulesToPopulate[record.groupId]) return false;
  if (groupwiseRulesToPopulate[record.groupId][GROUP_DETAILS]?.["status"] === GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE)
    return true;
  return false;
};

const checkIfRuleIsActive = (rule) => {
  return rule.status === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE;
};

/**
 * @param rules If not provided, fetch from Global State
 * @param groups If not provided, fetch from Global State
 */
const RulesTable = ({
  search,
  searchValue,
  setSearchValue,
  clearSearch,
  isTableLoading = false,
  handleChangeGroupOnClick,
  handleShareRulesOnClick,
  handleExportRulesOnClick,
  handleImportRulesOnClick,
  handleDeleteRulesOnClick,
  handleNewGroupOnClick,
  handleNewRuleOnClick,
  rules: rulesFromProps,
  groups: groupsFromProps,
  options,
  headerTitle,
  toolBarRender,
}) => {
  const navigate = useNavigate();
  // Component State
  const [isSharedListRuleViewerModalActive, setIsSharedListRuleViewModalActive] = useState(false);
  const [ruleToViewInModal, setRuleToViewInModal] = useState(false);

  const [isShareRulesModalActive, setIsShareRulesModalActive] = useState(false);

  const [isDeleteConfirmationModalActive, setIsDeleteConfirmationModalActive] = useState(false);
  const [isUngroupOrDeleteRulesModalActive, setIsUngroupOrDeleteRulesModalActive] = useState(false);
  const [isDuplicateRuleModalActive, setIsDuplicateRuleModalActive] = useState(false);
  const [ungroupOrDeleteRulesModalData, setUngroupOrDeleteRulesModalData] = useState(null);
  const [ruleToDelete, setRuleToDelete] = useState([]);
  const [ruleIdToDelete, setRuleIdToDelete] = useState([]);
  const [ruleToDuplicate, setRuleToDuplicate] = useState(null);
  const [size, setSize] = useState(window.innerWidth);
  const [sharedListModalRuleIDs, setSharedListModalRuleIDs] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState([UNGROUPED_GROUP_ID]);
  const [isGroupsStateUpdated, setIsGroupsStateUpdated] = useState(false);
  const [startFirstRuleWalkthrough, setStartFirstRuleWalkthrough] = useState(false);
  const [startFifthRuleWalkthrough, setStartFifthRuleWalkthrough] = useState(false);

  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const userAttributes = useSelector(getUserAttributes);
  const searchByRuleName = useSelector(getRulesSearchKeyword);
  const rulesData = useSelector(getAllRules);
  const rules = rulesFromProps ? rulesFromProps : rulesData;
  const groupsData = useSelector(getAllGroups);
  const groups = groupsFromProps ? groupsFromProps : groupsData;
  const rulesToPopulate = useSelector(getRulesToPopulate);
  const groupwiseRulesToPopulate = useSelector(getGroupwiseRulesToPopulate);
  const appMode = useSelector(getAppMode);
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const rulesSelection = useSelector(getRulesSelection);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const isMiscTourCompleted = useSelector(getIsMiscTourCompleted);
  const groupingAndRuleActivationExp = useFeatureValue("grouping_and_rule_activation", null);

  const selectedRules = getSelectedRules(rulesSelection);

  const isRemoveFromGroupDisabled = useMemo(
    () => rules.filter((rule) => rulesSelection[rule.id]).every((rule) => rule.groupId === UNGROUPED_GROUP_ID),
    [rules, rulesSelection]
  );

  const showGroupPinIcon = isFeatureCompatible(FEATURES.EXTENSION_GROUP_PIN_ICON);

  // Component State
  const selectedRowKeys = selectedRules;

  const expandedGroupRowKeys = useMemo(() => {
    return JSON.parse(window.localStorage.getItem("expandedGroups")) ?? [];
  }, []);

  const toggleSharedListRuleViewerModal = () => {
    setIsSharedListRuleViewModalActive(!isSharedListRuleViewerModalActive);
  };

  const toggleShareRulesModal = () => {
    setIsShareRulesModalActive(isShareRulesModalActive ? false : true);
  };
  const toggleDeleteConfirmationModal = () => {
    setIsDeleteConfirmationModalActive(isDeleteConfirmationModalActive ? false : true);
  };

  const toggleUngroupOrDeleteRulesModal = () => {
    setIsUngroupOrDeleteRulesModalActive(isUngroupOrDeleteRulesModalActive ? false : true);
  };

  const openRuleViewerInModal = (rule) => {
    setRuleToViewInModal(rule);
    setIsSharedListRuleViewModalActive(true);
  };

  const setRulesToPopulate = (rules) => {
    dispatch(actions.updateRulesToPopulate(rules));
  };

  const getPrettyDesktopRuleTooltipTitle = (ruleType) => {
    if (ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT) {
      return "This rule may not get executed using extension because the request redirects to a local file that cannot be accessed by the browser.";
    }
    return null;
  };

  const stableSetRulesToPopulate = useCallback(setRulesToPopulate, [dispatch]);

  const setGroupwiseRulesToPopulate = (incomingGroupwiseRules) => {
    dispatch(actions.updateGroupwiseRulesToPopulate(incomingGroupwiseRules));
  };

  const stableSetGroupwiseRulesToPopulate = useCallback(setGroupwiseRulesToPopulate, [dispatch]);

  const isStatusEnabled = !(options && options.disableStatus);
  const isEditingEnabled = !(options && options.disableEditing);
  const areActionsEnabled = !(options && options.disableActions);
  const isFavouritingAllowed = !(options && options.disableFavourites);
  const isAlertOptionsAllowed = !(options && options.disableAlertActions);

  const filterRulesBySearch = () => {
    if (searchByRuleName.length === 0) {
      stableSetRulesToPopulate(rules);
    } else {
      stableSetRulesToPopulate(rules.filter((rule) => rule.name.match(new RegExp(searchByRuleName, "i"))));
    }
  };
  const stableFilterRulesBySearch = useCallback(filterRulesBySearch, [
    rules,
    searchByRuleName,
    stableSetRulesToPopulate,
  ]);

  const generateGroupwiseRulesToPopulate = () => {
    const GroupwiseRulesToPopulateWIP = {};
    //Populate it with empty group (ungrouped)
    set(GroupwiseRulesToPopulateWIP, `${UNGROUPED_GROUP_ID}.${GROUP_DETAILS}`, {});
    set(GroupwiseRulesToPopulateWIP, `${UNGROUPED_GROUP_ID}.${GROUP_RULES}`, []);
    //Populate it with groups
    groups.forEach((group) => {
      set(GroupwiseRulesToPopulateWIP, `${group.id}.${GROUP_DETAILS}`, group);
      set(GroupwiseRulesToPopulateWIP, `${group.id}.${GROUP_RULES}`, []);
    });
    //Populate each group with respective rules
    //Sort rules by modificationDate or creationData before populating
    [...rulesToPopulate].sort(compareRuleByModificationDate).forEach((rule) => {
      get(GroupwiseRulesToPopulateWIP, `${rule.groupId}.${GROUP_RULES}`, []).push(rule);
    });
    stableSetGroupwiseRulesToPopulate(GroupwiseRulesToPopulateWIP);
  };

  const stableGenerateGroupwiseRulesToPopulate = useCallback(generateGroupwiseRulesToPopulate, [
    groups,
    rulesToPopulate,
    stableSetGroupwiseRulesToPopulate,
  ]);

  const getGroupRulesCount = (groupId) => {
    return get(groupwiseRulesToPopulate, `${groupId}.${GROUP_RULES}`, []).length;
  };

  const toggleIncomingGroupStatus = (groupData) => {
    const isGroupCurrentlyActive = groupData.status === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE;
    const updatedStatus = isGroupCurrentlyActive
      ? GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE
      : GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE;

    let createdBy;
    const currentOwner = user?.details?.profile?.uid || null;
    const lastModifiedBy = user?.details?.profile?.uid || null;

    if (typeof groupData.createdBy === "undefined") {
      createdBy = user?.details?.profile?.uid || null;
    } else {
      createdBy = groupData.createdBy;
    }

    const newGroup = {
      ...groupData,
      createdBy,
      currentOwner,
      lastModifiedBy,
      status: updatedStatus,
    };

    dispatch(actions.updateRecord(newGroup));

    Logger.log("Writing storage in RulesTable toggleIncomingGroupStatus");
    StorageService(appMode)
      .saveRuleOrGroup(newGroup)
      .then(() => {
        updatedStatus === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE
          ? toast.success(`Group is now ${updatedStatus.toLowerCase()}`)
          : toast.success(`Group is now ${updatedStatus.toLowerCase()}`);
      })
      .catch(() => {
        dispatch(actions.updateRecord(groupData));
      });
  };

  const handleGroupStatusOnClick = (event, groupData) => {
    event.stopPropagation();
    event.preventDefault();
    toggleIncomingGroupStatus(groupData);
    // //Analytics

    if (groupData.status === "Inactive") {
      trackGroupStatusToggled(true);
    } else {
      trackGroupStatusToggled(false);
    }
  };

  const ungroupSelectedRulesOnClickHandler = (event) => {
    event.stopPropagation();
    ungroupSelectedRules(appMode, selectedRules, user)
      .then(() => {
        clearSearch();

        //Unselect all rules
        unselectAllRules(dispatch);

        //Refresh List
        updateRulesListRefreshPendingStatus(dispatch, isRulesListRefreshPending);
      })
      .then(() => {
        toast.info("Rules Ungrouped");
        trackRulesUngrouped();
      })
      .catch(() => toast.warn("Please select rules first", { hideProgressBar: true }));
  };

  const deleteGroupOnClickHandler = (event, groupData) => {
    event.stopPropagation();

    deleteGroup(appMode, groupData.id, groupwiseRulesToPopulate)
      .then(async (args) => {
        if (args && args.err) {
          if (args.err === "ungroup-rules-first") {
            setUngroupOrDeleteRulesModalData(groupData);
            setIsUngroupOrDeleteRulesModalActive(true);
          }

          return;
        }
        updateRulesListRefreshPendingStatus(dispatch, isRulesListRefreshPending);
        toast.info("Group deleted");
        trackGroupDeleted();
      })
      .catch((err) => toast.warn(err, { hideProgressBar: true }));
  };

  const renameGroupOnClickHandler = (event, groupData) => {
    event.stopPropagation();
    const groupId = groupData.id;
    dispatch(
      actions.toggleActiveModal({
        modalName: "renameGroupModal",
        newValue: true,
        newProps: {
          groupId: { groupId },
        },
      })
    );
  };

  const changeFavouriteStatus = (newValue, rule) => {
    let currentOwner;

    if (rule.currentOwner) {
      currentOwner = user?.details?.profile?.uid || null;
    } else {
      currentOwner = rule.currentOwner;
    }

    const updatedRule = {
      ...rule,
      currentOwner,
      isFavourite: newValue,
    };

    dispatch(actions.updateRecord(updatedRule));
    Logger.log("Writing storage in RulesTable changeFavouriteState");
    StorageService(appMode)
      .saveRuleOrGroup(updatedRule, { silentUpdate: true })
      .then(() => {
        trackRulePinToggled(newValue);
      })
      .catch(() => {
        dispatch(actions.updateRecord(rule));
      });
  };

  const toggleFavourite = (rule) => {
    if (rule.isFavourite) {
      changeFavouriteStatus(false, rule);
    } else {
      changeFavouriteStatus(true, rule);
    }
  };

  const favouriteIconOnClickHandler = (event, rule) => {
    event.stopPropagation();
    if (isEditingEnabled) {
      toggleFavourite(rule);
    }
  };

  const pinGroupIconOnClickHandler = (event, record) => {
    event.stopPropagation();
    // Toggle Group's isFavorite
    if (isEditingEnabled) {
      toggleFavourite(record);
    }
  };

  const handleRuleNameOnClick = (e, rule) => {
    e.stopPropagation();
    if (isEditingEnabled) {
      redirectToRuleEditor(navigate, rule.id, "my_rules");
    } else if (openRuleViewerInModal) {
      openRuleViewerInModal(rule);
    }
  };

  const changeRuleStatus = (newStatus, rule) => {
    let currentOwner;

    if (rule.currentOwner) {
      currentOwner = user?.details?.profile?.uid || null;
    } else {
      currentOwner = rule.currentOwner;
    }
    const updatedRule = {
      ...rule,
      currentOwner,
      status: newStatus,
    };

    dispatch(actions.updateRecord(updatedRule));
    Logger.log("Writing storage in RulesTable changeRuleStatus");
    StorageService(appMode)
      .saveRuleOrGroup(updatedRule, { silentUpdate: true })
      .then((rule) => {
        //Push Notify
        newStatus === GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE
          ? toast.success(`Rule is now ${newStatus.toLowerCase()}`)
          : toast.success(`Rule is now ${newStatus.toLowerCase()}`);

        //Analytics
        if (newStatus.toLowerCase() === "active") {
          trackRQLastActivity("rule_activated");
          trackRuleActivatedStatusEvent(rule.ruleType);
        } else {
          trackRQLastActivity("rule_deactivated");
          trackRuleDeactivatedStatus(rule.ruleType);
        }
      })
      .catch(() => {
        dispatch(actions.updateRecord(rule));
      });
  };

  const toggleRuleStatus = (event, rule) => {
    event.preventDefault();
    event.stopPropagation();

    if (checkIfRuleIsActive(rule)) {
      changeRuleStatus(GLOBAL_CONSTANTS.RULE_STATUS.INACTIVE, rule);
    } else {
      changeRuleStatus(GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE, rule);
    }
  };

  const verifyAndContinueSharingRules = (rule) => {
    //Activate loading modal
    dispatch(
      actions.toggleActiveModal({
        modalName: "loadingModal",
        newValue: true,
      })
    );

    fetchSharedLists(user.details.profile.uid).then((result) => {
      //Continue creating new shared list
      setSharedListModalRuleIDs([rule.id]);
      setIsShareRulesModalActive(true);
      trackRQLastActivity("sharedList_created");

      //Deactivate loading modal
      dispatch(
        actions.toggleActiveModal({
          modalName: "loadingModal",
          newValue: false,
        })
      );
    });
  };

  const promptUserToSignup = (source) => {
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

  const shareIconOnClickHandler = (event, rule) => {
    event.stopPropagation();
    user.loggedIn ? verifyAndContinueSharingRules(rule) : promptUserToSignup(AUTH.SOURCE.SHARE_RULES);
  };

  const copyIconOnClickHandler = useCallback(async (event, rule) => {
    event.stopPropagation();
    setRuleToDuplicate(rule);
    setIsDuplicateRuleModalActive(true);
  }, []);

  const closeDuplicateRuleModal = useCallback(() => {
    setRuleToDuplicate(null);
    setIsDuplicateRuleModalActive(false);
  }, []);

  const deleteIconOnClickHandler = async (event, rule) => {
    event.stopPropagation();
    setRuleToDelete([rule]);
    setRuleIdToDelete([rule.id]);
    setIsDeleteConfirmationModalActive(true);
  };

  const onSelectChange = (selectedRowKeys) => {
    // Update the global state so that it could be consumed by other components as well

    // selectedRowKeys also contains the group ids, which we don't need, ProTable will handle it internally!
    const selectedRuleIds = selectedRowKeys.filter((objectId) => {
      return !objectId.startsWith("Group_") && objectId !== UNGROUPED_GROUP_ID;
    });

    const newSelectedRulesObject = {};

    selectedRuleIds.forEach((ruleId) => {
      newSelectedRulesObject[ruleId] = true;
    });

    dispatch(actions.updateSelectedRules(newSelectedRulesObject));
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    checkStrictly: false,
  };

  const LastModified = (props) => {
    const { beautifiedDate, uid } = props;
    return (
      <span>
        {beautifiedDate} by <UserIcon uid={uid} />
      </span>
    );
  };

  const columns = [
    {
      title: "Rule Details",
      dataIndex: "name",
      className: "rule-name-col",
      ellipsis: true,
      shouldCellUpdate: (record, prevRecord) => record.name !== prevRecord.name,
      onCell: (record) => {
        if (record.objectType === "group") {
          return {
            colSpan: 2,
          };
        }
      },
      render: (recordName, record) => {
        if (record.objectType === "group") {
          return (
            <span>
              <strong>{recordName}</strong> <i>({getGroupRulesCount(record.id)} Rules)</i>
            </span>
          );
        } else {
          return (
            <div
              style={{
                overflow: "hidden",
                wordBreak: "break-word",
                textOverflow: "ellipsis",
              }}
            >
              <Link
                onClick={(e) => {
                  handleRuleNameOnClick(e, record);
                }}
              >
                <span>
                  {recordName}
                  {isDesktopOnlyRule(record) && appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP && (
                    <InfoTag
                      title="Desktop App Only"
                      description={
                        <>
                          {getPrettyDesktopRuleTooltipTitle(record.ruleType)}{" "}
                          <a
                            className="tooltip-link"
                            href={LINKS.REQUESTLY_DOWNLOAD_PAGE}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Use this on Desktop App!
                          </a>
                        </>
                      }
                      tooltipWidth="400px"
                    />
                  )}
                </span>
              </Link>
              <br />
              <Text
                type="secondary"
                style={{
                  overflow: "hidden",
                  wordBreak: "break-word",
                  textOverflow: "ellipsis",
                }}
              >
                {record.description}
              </Text>
            </div>
          );
        }
      },
    },
    {
      title: "Type",
      dataIndex: "ruleType",
      align: "center",
      shouldCellUpdate: (record, prevRecord) => record.ruleType !== prevRecord.ruleType,
      onCell: (record) => {
        if (record.objectType && record.objectType === "group") {
          return {
            colSpan: 0,
          };
        }
      },
      render: (_, record) => {
        if (record.objectType && record.objectType !== "group") {
          return <RuleTypeTag ruleType={record.ruleType} />;
        }
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      align: "center",
      width: 80,
      render: (_, record, index) => {
        if (record.objectType && record.objectType === "group") {
          if (isStatusEnabled && record.id !== UNGROUPED_GROUP_ID) {
            if (isEditingEnabled) {
              return (
                <Switch
                  size="small"
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  checked={checkIfRuleIsActive(record)}
                  onClick={(_, event) => handleGroupStatusOnClick(event, record)}
                />
              );
            }
            return <Text>{checkIfRuleIsActive(record) ? "On" : "Off"}</Text>;
          }
          return null;
        }

        // It is a Rule!
        if (!isStatusEnabled) return <Text>{checkIfRuleIsActive(record) ? "On" : "Off"}</Text>;

        if (isEditingEnabled) {
          return (
            <Switch
              size="small"
              // We Rule's group is OFF, this switch must be disabled
              disabled={isGroupSwitchDisabled(record, groupwiseRulesToPopulate)}
              checked={checkIfRuleIsActive(record)}
              onClick={(_, event) => toggleRuleStatus(event, record)}
              data-tour-id={index === 0 ? "rule-table-switch-status" : null}
            />
          );
        }
        return <Text>{checkIfRuleIsActive(record) ? "On" : "Off"}</Text>;
      },
    },
    {
      title: "Last Modified",
      align: "center",
      width: 150,
      responsive: ["lg"],
      dataIndex: "modificationDate",
      valueType: "date",
      shouldCellUpdate: (record, prevRecord) => record.modificationDate !== prevRecord.modificationDate,
      render: (_, record) => {
        if (record.objectType && record.objectType === "group") {
          return null;
        }
        const dateToDisplay = record.modificationDate ? record.modificationDate : record.creationDate;
        const beautifiedDate = moment(dateToDisplay).format("MMM DD");
        if (currentlyActiveWorkspace?.id && !options.hideLastModifiedBy) {
          return <LastModified beautifiedDate={beautifiedDate} uid={record.lastModifiedBy} />;
        } else return beautifiedDate;
      },
    },
    {
      title: "",
      // width: "100%",
      align: "center",
      render: (_, record) => {
        // Actions must not be visible when selectedRules array is not empty
        const isPinned = record.isFavourite;
        const hideActionButtons = !isEmpty(selectedRules);

        if (record.objectType && record.objectType === "group") {
          if (areActionsEnabled && record.id !== UNGROUPED_GROUP_ID) {
            return (
              <ReactHoverObserver>
                {({ isHovering }) => (
                  <div className={hideActionButtons ? "group-action-buttons hidden-element" : "group-action-buttons"}>
                    <Space>
                      {isFavouritingAllowed && showGroupPinIcon && (
                        <Text
                          type={isHovering ? "primary" : "secondary"}
                          className={`cursor-pointer ${isPinned ? "show-record" : ""}`}
                        >
                          <Tooltip title={isPinned ? "Unpin Group" : "Pin Group"}>
                            <Tag onClick={(e) => pinGroupIconOnClickHandler(e, record)}>
                              {record.isFavourite ? (
                                <PushpinFilled
                                  style={{
                                    cursor: "pointer",
                                  }}
                                  className="fix-primary2-color"
                                />
                              ) : (
                                <PushpinOutlined
                                  style={{
                                    cursor: "pointer",
                                  }}
                                />
                              )}
                            </Tag>
                          </Tooltip>
                        </Text>
                      )}
                      <Text type={isHovering ? "primary" : "secondary"} style={{ cursor: "pointer" }}>
                        <Tooltip title="Remove selected rules from group">
                          <Tag onClick={(e) => ungroupSelectedRulesOnClickHandler(e)}>
                            <UngroupOutlined
                              style={{
                                cursor: "pointer",
                              }}
                            />
                          </Tag>
                        </Tooltip>
                      </Text>
                      <Text type={isHovering ? "primary" : "secondary"} style={{ cursor: "pointer" }}>
                        <Tooltip title="Rename Group">
                          <Tag onClick={(e) => renameGroupOnClickHandler(e, record)}>
                            <EditOutlined
                              style={{
                                cursor: "pointer",
                              }}
                            />
                          </Tag>
                        </Tooltip>
                      </Text>
                      <Text type={isHovering ? "primary" : "secondary"} style={{ cursor: "pointer" }}>
                        <Tooltip title="Delete Group">
                          <Tag
                            onClick={(e) => {
                              deleteGroupOnClickHandler(e, record);
                              handleGroupState(false, record);
                            }}
                          >
                            <DeleteOutlined
                              style={{
                                cursor: "pointer",
                              }}
                            />
                          </Tag>
                        </Tooltip>
                      </Text>
                    </Space>
                  </div>
                )}
              </ReactHoverObserver>
            );
          }
          return null;
        }
        // This is a Rule

        if (areActionsEnabled) {
          return (
            <div className={hideActionButtons ? "rule-action-buttons hidden-element" : "rule-action-buttons"}>
              <ReactHoverObserver>
                {({ isHovering }) => (
                  <Space>
                    {isFavouritingAllowed && (
                      <Text
                        type={isHovering ? "primary" : "secondary"}
                        className={`cursor-pointer ${isPinned ? "show-record" : ""}`}
                      >
                        <Tooltip title={isPinned ? "Unpin Rule" : "Pin Rule"}>
                          <Tag onClick={(e) => favouriteIconOnClickHandler(e, record)}>
                            {record.isFavourite ? (
                              <PushpinFilled
                                style={{
                                  padding: "5px 0px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                }}
                                className="fix-primary2-color"
                              />
                            ) : (
                              <PushpinOutlined
                                style={{
                                  padding: "5px 0px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                }}
                              />
                            )}
                          </Tag>
                        </Tooltip>
                      </Text>
                    )}
                    <Text type={isHovering ? "primary" : "secondary"} style={{ cursor: "pointer" }}>
                      <Tooltip title="Share with your Teammates">
                        <Tag onClick={(e) => shareIconOnClickHandler(e, record)}>
                          <UsergroupAddOutlined />
                        </Tag>
                      </Tooltip>
                    </Text>
                    <Text type={isHovering ? "primary" : "secondary"} style={{ cursor: "pointer" }}>
                      <Tooltip title="Duplicate Rule">
                        <Tag onClick={(e) => copyIconOnClickHandler(e, record)}>
                          <CopyOutlined
                            style={{
                              padding: "5px 0px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          />
                        </Tag>
                      </Tooltip>
                    </Text>
                    <Text type={isHovering ? "primary" : "secondary"} style={{ cursor: "pointer" }}>
                      <Tooltip title="Delete Rule">
                        <Tag onClick={(e) => deleteIconOnClickHandler(e, record)}>
                          <DeleteOutlined
                            style={{
                              padding: "5px 0px",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          />
                        </Tag>
                      </Tooltip>
                    </Text>
                  </Space>
                )}
              </ReactHoverObserver>
            </div>
          );
        }
        return (
          <ReactHoverObserver>
            {({ isHovering }) => (
              <Space>
                <Text type={isHovering ? "primary" : "secondary"} style={{ cursor: "pointer" }}>
                  <Tooltip title="View rule">
                    <EyeOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        openRuleViewerInModal(record);
                      }}
                    />
                  </Tooltip>
                </Text>
              </Space>
            )}
          </ReactHoverObserver>
        );
      },
    },
  ];

  if (isWorkspaceMode && !options.hideCreatedBy) {
    columns.splice(3, 0, {
      title: "Created by",
      align: "center",
      width: "100px",
      responsive: ["lg"],
      dataIndex: "createdBy",
      valueType: "date",
      render: (_, record) => {
        if (record.objectType && record.objectType === "group") {
          return null;
        }
        const uid = record.createdBy ?? null;
        if (currentlyActiveWorkspace?.id) {
          return <UserIcon uid={uid} />;
        } else return null;
      },
    });
  }

  const cleanup = () => {
    //Unselect all rules
    unselectAllRules(dispatch);
  };

  const EscFn = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      // navigate.goBack();
    }
  };

  const stableCleanup = useCallback(cleanup, [dispatch]);

  useEffect(() => {
    //Cleanup
    //Unselect All Rules when navigated away
    return stableCleanup;
  }, [stableCleanup]);

  useEffect(() => {
    if (headerTitle) {
      document.addEventListener("keydown", EscFn);
    }
    window.addEventListener("resize", () => {
      setSize(window.innerWidth);
    });
    return () => {
      if (headerTitle) document.removeEventListener("keydown", EscFn);
      window.removeEventListener("resize", () => {
        setSize(window.innerWidth);
      });
    };
  }, [headerTitle]);

  useEffect(() => {
    stableFilterRulesBySearch();
  }, [stableFilterRulesBySearch]);

  useEffect(() => {
    stableGenerateGroupwiseRulesToPopulate();
  }, [stableGenerateGroupwiseRulesToPopulate]);

  useEffect(() => {
    dispatch(actions.updateGroups(groups));
  }, [dispatch, groups]);

  useEffect(() => {
    if (search) {
      const expandableRows = document.querySelectorAll(".expanded-row");
      expandableRows.forEach((row) => {
        const isCollapsed = row.querySelector(".ant-table-row-expand-icon-collapsed");

        if (isCollapsed) {
          row.click();
        }
      });
    }
  }, [search]);

  useEffect(() => {
    if (window.localStorage.getItem("expandedGroups") && !isGroupsStateUpdated) {
      let stateData = JSON.parse(window.localStorage.getItem("expandedGroups"));
      setExpandedGroups(stateData);
      setIsGroupsStateUpdated(true);
    }
  }, [expandedGroups, isGroupsStateUpdated]);

  const proTableData = useMemo(() => {
    const tableData = Object.keys(groupwiseRulesToPopulate).map((G_ID) => {
      const dataObject = { ...groupwiseRulesToPopulate[G_ID][GROUP_DETAILS] };
      dataObject["children"] = groupwiseRulesToPopulate[G_ID][GROUP_RULES];

      // Handle case of UNGROUPED
      if (!dataObject["name"]) {
        dataObject["creationDate"] = 1629967497355; // Random - Just to maintain structure
        dataObject["description"] = "";
        dataObject["id"] = UNGROUPED_GROUP_ID;
        dataObject["name"] = UNGROUPED_GROUP_NAME;
        dataObject["objectType"] = "group";
        dataObject["status"] = GLOBAL_CONSTANTS.RULE_STATUS.ACTIVE;
      }
      return dataObject;
    });

    // Move "Ungrouped" group to last
    if (!isEmpty(tableData) && tableData[0].id === UNGROUPED_GROUP_ID) {
      // When the "Ungrouped" group is empty, we dont need to show it
      if (isEmpty(tableData[0].children)) {
        // Remove the Ungrouped group from array!
        tableData.splice(0, 1);
      } else {
        // Continue moving "Ungrouped" group to last
        tableData.push(tableData.shift());
      }
    }

    return tableData;
  }, [groupwiseRulesToPopulate]);

  const getSearchedRules = useCallback(
    (searchText) =>
      searchText && proTableData.length > 0
        ? proTableData
            .map((group) => {
              const filteredRules = group.children.filter((rule) =>
                rule.name.toLowerCase().includes(searchText.toLowerCase())
              );

              return { ...group, expanded: true, children: filteredRules };
            })
            .filter((group) => group.children.length)
        : proTableData,
    [proTableData]
  );

  //handle group expanded state & update localStorage
  const handleGroupState = (expanded, record) => {
    if (
      expanded &&
      !expandedGroups.includes(record.id) &&
      (record.id.includes("Group_") || record.name === "Ungrouped")
    ) {
      let x = expandedGroups.concat(record.id);
      setExpandedGroups(x);
      window.localStorage.setItem("expandedGroups", JSON.stringify(x));
    }
    if (
      !expanded &&
      expandedGroups.includes(record.id) &&
      (record.id.includes("Group_") || record.name === "Ungrouped")
    ) {
      let x = expandedGroups;
      let rIndex = x.indexOf(record.id);
      x.splice(rIndex, 1);
      setExpandedGroups(x);
      window.localStorage.setItem("expandedGroups", JSON.stringify(expandedGroups));
    }
  };

  const handleDefaultExpandAllRowKeys = () => {
    let rowKeys = groups.map((group) => group.id);
    rowKeys.push("");
    return rowKeys;
  };

  const handleClearSelectedRules = () => {
    dispatch(actions.clearSelectedRules());
  };

  const dropdownOverlay = useMemo(
    () => (
      <Menu>
        {Object.values(RULE_TYPES_CONFIG)
          .filter((ruleConfig) => ruleConfig.ID !== 11)
          .map(({ ID, TYPE, ICON, NAME }) => (
            <Menu.Item
              key={ID}
              icon={<ICON />}
              onClick={(e) => handleNewRuleOnClick(e, TYPE)}
              className="rule-selection-dropdown-btn-overlay-item"
            >
              {NAME}
            </Menu.Item>
          ))}
      </Menu>
    ),
    [handleNewRuleOnClick]
  );

  useEffect(() => {
    if (groupingAndRuleActivationExp === "variant1") {
      if (!isMiscTourCompleted?.firstRule && userAttributes?.num_rules === 1) setStartFirstRuleWalkthrough(true);
      if (!isMiscTourCompleted?.fifthRule && !userAttributes?.num_groups && userAttributes?.num_rules === 5)
        setStartFifthRuleWalkthrough(true);
    }
  }, [
    isMiscTourCompleted?.fifthRule,
    isMiscTourCompleted?.firstRule,
    userAttributes?.num_groups,
    userAttributes?.num_rules,
    groupingAndRuleActivationExp,
  ]);

  return (
    <>
      <ProductWalkthrough
        tourFor={MISC_TOURS.APP_ENGAGEMENT.FIFTH_RULE}
        startWalkthrough={startFifthRuleWalkthrough}
        onTourComplete={() =>
          dispatch(actions.updateProductTourCompleted({ tour: TOUR_TYPES.MISCELLANEOUS, subTour: "fifthRule" }))
        }
      />
      <ProductWalkthrough
        tourFor={MISC_TOURS.APP_ENGAGEMENT.FIRST_RULE}
        startWalkthrough={startFirstRuleWalkthrough}
        onTourComplete={() =>
          dispatch(actions.updateProductTourCompleted({ tour: TOUR_TYPES.MISCELLANEOUS, subTour: "firstRule" }))
        }
      />
      <ProTable
        scroll={{ x: 900 }}
        className="records-table"
        locale={{
          emptyText: searchValue ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No rule found with given name" />
          ) : (
            "No rule"
          ),
        }}
        rowClassName={(record, index) => {
          if (record.objectType === "group" && record.id === UNGROUPED_GROUP_ID) {
            return "hidden";
          } else if (record.objectType === "group") {
            return `rule-group-row ${!!record.expanded && "expanded-row"}`;
          } else if ((record.objectType === "rule") & (record.groupId === "")) {
            return "ungroup-rule-row";
          }
        }}
        columnsState={{
          persistenceKey: "rules-index-table",
          persistenceType: "localStorage",
        }}
        loading={isTableLoading}
        expandable={{
          defaultExpandAllRows: options.isSharedListRuleTable,
          defaultExpandedRowKeys: options.isSharedListRuleTable
            ? handleDefaultExpandAllRowKeys()
            : expandedGroupRowKeys.concat([UNGROUPED_GROUP_ID]), // "Ungroup" group should always be expanded
          expandRowByClick: true,
          rowExpandable: true,
          expandedRowClassName: "expanded-row",
        }}
        //update localStorage on expanding a group in rules table
        onExpand={(expanded, record) => {
          handleGroupState(expanded, record);
        }}
        tableAlertRender={(_) => {
          return (
            <div>
              <Tooltip placement="top" title="Clear selected rules">
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  style={{ margin: "0 8px 0 -14px" }}
                  onClick={handleClearSelectedRules}
                />
              </Tooltip>
              <span>{`${_.selectedRowKeys.length} Rules selected`}</span>
            </div>
          );
        }}
        tableAlertOptionRender={() => {
          const isScreenSmall = size < 1150;
          return isAlertOptionsAllowed ? (
            <Space style={{ margin: "-5px" }}>
              <Tooltip title={isScreenSmall ? "Remove from Group" : null}>
                <Button
                  disabled={isRemoveFromGroupDisabled}
                  onClick={(e) => ungroupSelectedRulesOnClickHandler(e)}
                  shape={isScreenSmall ? "circle" : null}
                  icon={<UngroupOutlined />}
                >
                  {isScreenSmall ? null : "Remove from Group"}
                </Button>
              </Tooltip>
              <Tooltip title={isScreenSmall ? "Change Group" : null}>
                <Button
                  onClick={handleChangeGroupOnClick}
                  shape={isScreenSmall ? "circle" : null}
                  icon={<FolderOpenOutlined />}
                >
                  {isScreenSmall ? null : "Change Group"}
                </Button>
              </Tooltip>
              <AuthConfirmationPopover
                title="You need to sign up to share rules"
                callback={handleShareRulesOnClick}
                source={AUTH.SOURCE.SHARE_RULES}
              >
                <Tooltip title={isScreenSmall ? "Share Rules" : null}>
                  <Button
                    onClick={user?.details?.isLoggedIn && handleShareRulesOnClick}
                    shape={isScreenSmall ? "circle" : null}
                    icon={<UsergroupAddOutlined />}
                  >
                    {isScreenSmall ? null : "Share"}
                  </Button>
                </Tooltip>
              </AuthConfirmationPopover>
              <AuthConfirmationPopover
                title="You need to sign up to export rules"
                callback={handleExportRulesOnClick}
                source={AUTH.SOURCE.EXPORT_RULES}
              >
                <Tooltip title={isScreenSmall ? "Export Rules" : null}>
                  <Button
                    shape={isScreenSmall ? "circle" : null}
                    onClick={user?.details?.isLoggedIn && handleExportRulesOnClick}
                    icon={<UploadOutlined />}
                  >
                    {isScreenSmall ? null : "Export"}
                  </Button>
                </Tooltip>
              </AuthConfirmationPopover>
              <Tooltip title={isScreenSmall ? (user.loggedIn ? "Move to Trash" : "Delete Permanently") : null}>
                <Button
                  danger
                  shape={isScreenSmall ? "circle" : null}
                  onClick={handleDeleteRulesOnClick}
                  icon={<DeleteOutlined />}
                >
                  {isScreenSmall ? null : user.loggedIn ? "Move to Trash" : "Delete Permanently"}
                </Button>
              </Tooltip>
            </Space>
          ) : null;
        }}
        rowSelection={options.disableSelection ? false : rowSelection}
        columns={columns}
        dataSource={getSearchedRules(searchValue)}
        rowKey="id"
        pagination={false}
        search={false}
        dateFormatter={false}
        headerTitle={
          headerTitle ? (
            headerTitle
          ) : selectedRowKeys.length > 0 ? null : (
            <>
              {size < 800 ? null : "My Rules "}
              <Input
                allowClear
                placeholder="Search by rule name"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
                prefix={<SearchOutlined />}
                style={{ width: 240, marginLeft: "8px" }}
              />
            </>
          )
        }
        options={false}
        toolBarRender={
          toolBarRender
            ? toolBarRender
            : selectedRowKeys.length > 0
            ? null
            : () => {
                const isScreenSmall = size < 1150;
                const buttonData = [
                  {
                    shape: "circle",
                    isTooltipShown: true,
                    hasPopconfirm: true,
                    buttonText: "Import",
                    authSource: AUTH.SOURCE.UPLOAD_RULES,
                    icon: <DownloadOutlined />,
                    onClickHandler: handleImportRulesOnClick,
                    trackClickEvent: () => {
                      trackUploadRulesButtonClicked(AUTH.SOURCE.RULES_LIST);
                    },
                  },
                  {
                    shape: "circle",
                    isTooltipShown: true,
                    hasPopconfirm: true,
                    buttonText: "Export",
                    authSource: AUTH.SOURCE.EXPORT_RULES,
                    icon: <UploadOutlined />,
                    onClickHandler: handleExportRulesOnClick,
                  },
                  {
                    shape: "circle",
                    isTooltipShown: true,
                    hasPopconfirm: true,
                    buttonText: "Share",
                    authSource: AUTH.SOURCE.SHARE_RULES,
                    icon: <UsergroupAddOutlined />,
                    onClickHandler: handleShareRulesOnClick,
                  },
                  {
                    shape: "circle",
                    isTooltipShown: true,
                    tourId: "rule-table-create-group-btn",
                    buttonText: "New Group",
                    icon: <GroupOutlined />,
                    onClickHandler: handleNewGroupOnClick,
                  },
                  {
                    shape: null,
                    type: "primary",
                    isTooltipShown: false,
                    buttonText: "New Rule",
                    icon: <DownOutlined />,
                    onClickHandler: handleNewRuleOnClick,
                    isDropdown: true,
                    overlay: dropdownOverlay,
                  },
                ];

                return buttonData.map(
                  ({
                    icon,
                    shape,
                    type = null,
                    buttonText,
                    authSource,
                    isTooltipShown,
                    onClickHandler,
                    isDropdown = false,
                    hasPopconfirm = false,
                    tourId = null,
                    trackClickEvent = () => {},
                    overlay,
                  }) => (
                    <Tooltip key={buttonText} title={isTooltipShown && isScreenSmall ? buttonText : null}>
                      <>
                        {isDropdown ? (
                          <Dropdown.Button
                            icon={icon}
                            type={type}
                            onClick={onClickHandler}
                            overlay={overlay}
                            className="rule-selection-dropdown-btn"
                          >
                            {buttonText}
                          </Dropdown.Button>
                        ) : (
                          <AuthConfirmationPopover
                            title={`You need to sign up to ${buttonText.toLowerCase()} rules`}
                            disabled={!hasPopconfirm}
                            callback={onClickHandler}
                            source={authSource}
                          >
                            <Button
                              type={type || "default"}
                              shape={isScreenSmall ? shape : null}
                              onClick={() => {
                                trackClickEvent();
                                hasPopconfirm ? user?.details?.isLoggedIn && onClickHandler() : onClickHandler();
                              }}
                              icon={icon}
                              data-tour-id={tourId}
                            >
                              {!isTooltipShown ? buttonText : isScreenSmall ? null : buttonText}
                            </Button>
                          </AuthConfirmationPopover>
                        )}
                      </>
                    </Tooltip>
                  )
                );
              }
        }
      />
      {isSharedListRuleViewerModalActive ? (
        <SharedListRuleViewerModal
          isOpen={isSharedListRuleViewerModalActive}
          toggle={toggleSharedListRuleViewerModal}
          rule={ruleToViewInModal}
        />
      ) : null}
      {isShareRulesModalActive ? (
        <CreateSharedListModal
          isOpen={isShareRulesModalActive}
          toggle={toggleShareRulesModal}
          rulesToShare={sharedListModalRuleIDs}
        />
      ) : null}
      {isDeleteConfirmationModalActive ? (
        <DeleteRulesModal
          isOpen={isDeleteConfirmationModalActive}
          toggle={toggleDeleteConfirmationModal}
          recordsToDelete={ruleToDelete}
          ruleIdsToDelete={ruleIdToDelete}
          clearSearch={clearSearch}
        />
      ) : null}
      {isUngroupOrDeleteRulesModalActive ? (
        <UngroupOrDeleteRulesModal
          isOpen={isUngroupOrDeleteRulesModalActive}
          toggle={toggleUngroupOrDeleteRulesModal}
          data={ungroupOrDeleteRulesModalData}
          setData={setUngroupOrDeleteRulesModalData}
        />
      ) : null}
      {isDuplicateRuleModalActive ? (
        <DuplicateRuleModal
          isOpen={isDuplicateRuleModalActive}
          close={closeDuplicateRuleModal}
          rule={ruleToDuplicate}
          onDuplicate={closeDuplicateRuleModal}
        />
      ) : null}
    </>
  );
};

export default RulesTable;
