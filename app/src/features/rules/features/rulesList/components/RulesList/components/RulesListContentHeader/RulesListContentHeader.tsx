import { DownOutlined, DownloadOutlined } from "@ant-design/icons";
import { RiFolderAddLine } from "@react-icons/all-files/ri/RiFolderAddLine";
import { Badge, Dropdown, Menu, Tooltip } from "antd";
import { DropdownButtonType } from "antd/lib/dropdown";
import { PremiumIcon } from "components/common/PremiumIcon";
import AuthPopoverButton from "components/features/rules/RulesListContainer/RulesTable/AuthPopoverButtons";
import ContentListHeader, { ContentListHeaderProps, FilterType } from "componentsV2/ContentList/ContentListHeader";
import APP_CONSTANTS from "config/constants";
import RULE_TYPES_CONFIG from "config/constants/sub/rule-types";
import { PremiumFeature } from "features/pricing";
import { RecordStatus, StorageRecord } from "features/rules/types/rules";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { SOURCE } from "modules/analytics/events/common/constants";
import React, { useCallback, useMemo } from "react";
import { RuleType } from "types";
import { isRule } from "../RulesTable/utils";
import { MdOutlinePushPin } from "@react-icons/all-files/md/MdOutlinePushPin";
import { RiCheckLine } from "@react-icons/all-files/ri/RiCheckLine";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { redirectToCreateNewRule } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import useRuleTableActions from "../RulesTable/hooks/useRuleTableActions";

interface Props {
  searchValue: string;
  setSearchValue: (value: string) => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  records: StorageRecord[];
}

const RulesListContentHeader: React.FC<Props> = ({ searchValue, setSearchValue, filter, setFilter, records }) => {
  const navigate = useNavigate();
  const { getFeatureLimitValue } = useFeatureLimiter();
  const { handleRecordsImport, handleGroupCreate } = useRuleTableActions();
  const user = useSelector(getUserAuthDetails);

  const handleNewRuleOnClick = useCallback(
    async (ruleType?: any, source = SOURCE.RULE_TABLE_CREATE_NEW_RULE_BUTTON) => {
      // if (ruleType) trackRuleCreationWorkflowStartedEvent(ruleType, source);
      // else trackNewRuleButtonClicked("in_app");
      redirectToCreateNewRule(navigate, ruleType, "my_rules");
      return;
    },
    [navigate]
  );

  const dropdownOverlay = useMemo(() => {
    // FIXME: RuleType needed?
    const checkIsPremiumRule = (ruleType: RuleType) => {
      const featureName = `${ruleType.toLowerCase()}_rule`;
      return !getFeatureLimitValue(featureName as FeatureLimitType);
    };

    return (
      <Menu>
        {Object.values(RULE_TYPES_CONFIG)
          .filter((ruleConfig) => ruleConfig.ID !== 11)
          .map(({ ID, TYPE, ICON, NAME }) => (
            <PremiumFeature
              popoverPlacement="topLeft"
              onContinue={() => handleNewRuleOnClick(TYPE, SOURCE.DROPDOWN)}
              features={[`${TYPE.toLowerCase()}_rule` as FeatureLimitType, FeatureLimitType.num_rules]}
              featureName={`${APP_CONSTANTS.RULE_TYPES_CONFIG[TYPE]?.NAME} rule`}
              source="rule_selection_dropdown"
            >
              <Menu.Item key={ID} icon={<ICON />} className="rule-selection-dropdown-btn-overlay-item">
                {NAME}
                {checkIsPremiumRule(TYPE) ? (
                  <PremiumIcon
                    placement="topLeft"
                    source="rule_dropdown"
                    featureType={`${TYPE.toLowerCase()}_rule` as FeatureLimitType}
                  />
                ) : null}
              </Menu.Item>
            </PremiumFeature>
          ))}
      </Menu>
    );
  }, [handleNewRuleOnClick, getFeatureLimitValue]);

  const buttonData = [
    {
      type: "text",
      isTooltipShown: true,
      tourId: "rule-table-create-group-btn",
      buttonText: "New Group",
      icon: <RiFolderAddLine className="anticon" />,
      onClickHandler: handleGroupCreate,
    },
    {
      isTooltipShown: true,
      hasPopconfirm: true,
      buttonText: "Import",
      authSource: SOURCE.UPLOAD_RULES,
      icon: <DownloadOutlined />,
      onClickHandler: handleRecordsImport,
      trackClickEvent: () => {
        // trackUploadRulesButtonClicked(SOURCE.RULES_LIST);
      },
    },
    {
      type: "primary",
      isTooltipShown: false,
      buttonText: "New Rule",
      icon: <DownOutlined />,
      onClickHandler: handleNewRuleOnClick,
      isDropdown: true,
      overlay: dropdownOverlay,
    },
  ];

  const handleSearchValueUpdate = (value: string) => {
    setSearchValue(value);
    // debouncedTrackRulesListSearched(value);
  };

  const contentHeaderActions = buttonData.map(
    (
      { icon, type = null, buttonText, isTooltipShown, onClickHandler, isDropdown = false, overlay, tourId = null },
      index
    ) => (
      <Tooltip key={index} title={isTooltipShown ? buttonText : null}>
        <>
          {isDropdown ? (
            <Dropdown.Button
              icon={icon}
              type={type as DropdownButtonType}
              trigger={["click"]}
              onClick={() => onClickHandler()}
              overlay={overlay}
              data-tour-id={tourId}
              className="rule-selection-dropdown-btn"
            >
              {buttonText}
            </Dropdown.Button>
          ) : (
            // @ts-ignore
            <AuthPopoverButton isLoggedIn={user?.details?.isLoggedIn} {...buttonData[index]} />
          )}
        </>
      </Tooltip>
    )
  );

  const contentHeaderFilters: ContentListHeaderProps["filters"] = useMemo(
    () => [
      {
        key: "all",
        label: (
          <div className="label">
            All{" "}
            {records.length ? (
              <Badge count={records.filter((record) => isRule(record)).length} overflowCount={20} />
            ) : null}
          </div>
        ),
        onClick: () => {
          setFilter("all");
          // trackRulesListFilterApplied("all", allRecords.length, allRecords.length);
        },
      },
      {
        key: "pinned",
        label: (
          <div className="label">
            <MdOutlinePushPin className="icon" />
            Pinned
            {/* FIXME: Performance Improvements and logic */}
            {records.length ? (
              <Badge
                count={records.filter((record) => record.isFavourite && isRule(record)).length}
                overflowCount={20}
              />
            ) : null}
          </div>
        ),
        onClick: () => {
          setFilter("pinned");
          // trackRulesListFilterApplied("pinned", allRecords.length, pinnedRecords.length);
        },
      },
      {
        key: "active",
        label: (
          <div className="label">
            <RiCheckLine className="icon" />
            Active {/* FIXME: Performance Improvements and logic */}
            {records.length ? (
              <Badge
                count={records.filter((record) => record.status === RecordStatus.ACTIVE && isRule(record)).length}
                overflowCount={20}
              />
            ) : null}
          </div>
        ),
        onClick: () => {
          setFilter("active");
          // trackRulesListFilterApplied("active", allRecords.length, activeRecords.length);
        },
      },
    ],
    [records, setFilter]
  );

  return (
    <ContentListHeader
      title="My Rules"
      subtitle="Create and manage your rules from here"
      actions={contentHeaderActions}
      searchValue={searchValue}
      setSearchValue={handleSearchValueUpdate}
      activeFilter={filter}
      filters={contentHeaderFilters}
    />
  );
};

export default RulesListContentHeader;
