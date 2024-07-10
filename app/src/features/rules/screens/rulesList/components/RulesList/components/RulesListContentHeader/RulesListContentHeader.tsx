import { DownloadOutlined } from "@ant-design/icons";
import { RiFolderAddLine } from "@react-icons/all-files/ri/RiFolderAddLine";
import { Badge, Button, Dropdown, Tooltip } from "antd";
import AuthPopoverButton from "components/features/rules/RulesListContainer/RulesTable/AuthPopoverButtons";
import { ContentListHeader, ContentListHeaderProps, FilterType } from "componentsV2/ContentList";
import { RecordStatus, StorageRecord } from "features/rules/types/rules";
import { SOURCE } from "modules/analytics/events/common/constants";
import React, { useMemo } from "react";
import { isRule } from "features/rules/utils";
import { MdOutlinePushPin } from "@react-icons/all-files/md/MdOutlinePushPin";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { trackUploadRulesButtonClicked } from "modules/analytics/events/features/rules";
import { useDebounce } from "hooks/useDebounce";
import { trackRulesListFilterApplied, trackRulesListSearched } from "features/rules/analytics";
import { useRulesActionContext } from "features/rules/context/actions";
import { MdOutlineToggleOn } from "@react-icons/all-files/md/MdOutlineToggleOn";
import { RuleSelectionList } from "../RuleSelectionList/RuleSelectionList";

interface Props {
  searchValue: string;
  setSearchValue: (value: string) => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  records: StorageRecord[];
}

const RulesListContentHeader: React.FC<Props> = ({ searchValue, setSearchValue, filter, setFilter, records }) => {
  // const { getFeatureLimitValue } = useFeatureLimiter();
  const user = useSelector(getUserAuthDetails);
  const debouncedTrackRulesListSearched = useDebounce(trackRulesListSearched, 500);

  const { createRuleAction, createGroupAction, importRecordsAction } = useRulesActionContext();

  // const dropdownOverlay = useMemo(() => {
  //   // FIXME: RuleType needed?
  //   const checkIsPremiumRule = (ruleType: RuleType) => {
  //     const featureName = `${ruleType.toLowerCase()}_rule`;
  //     return !getFeatureLimitValue(featureName as FeatureLimitType);
  //   };

  //   return (
  //     <Menu>
  //       {Object.values(RULE_TYPES_CONFIG)
  //         .filter((ruleConfig) => ruleConfig.ID !== 11)
  //         .map(({ ID, TYPE, ICON, NAME }) => (
  //           <PremiumFeature
  //             popoverPlacement="topLeft"
  //             onContinue={() => createRuleAction(TYPE as RuleType, SOURCE.DROPDOWN)}
  //             features={[`${TYPE.toLowerCase()}_rule` as FeatureLimitType, FeatureLimitType.num_rules]}
  //             featureName={`${APP_CONSTANTS.RULE_TYPES_CONFIG[TYPE]?.NAME} rule`}
  //             source="rule_selection_dropdown"
  //           >
  //             <Menu.Item key={ID} icon={<ICON />} className="rule-selection-dropdown-btn-overlay-item">
  //               {NAME}
  //               {checkIsPremiumRule(TYPE as RuleType) ? (
  //                 <PremiumIcon
  //                   placement="topLeft"
  //                   source="rule_dropdown"
  //                   featureType={`${TYPE.toLowerCase()}_rule` as FeatureLimitType}
  //                 />
  //               ) : null}
  //             </Menu.Item>
  //           </PremiumFeature>
  //         ))}
  //     </Menu>
  //   );
  // }, [createRuleAction, getFeatureLimitValue]);

  const buttonData = [
    {
      type: "text",
      isTooltipShown: true,
      tourId: "rule-table-create-group-btn",
      buttonText: "New Group",
      icon: <RiFolderAddLine className="anticon" />,
      onClickHandler: createGroupAction,
    },
    {
      isTooltipShown: true,
      hasPopconfirm: true,
      buttonText: "Import",
      authSource: SOURCE.UPLOAD_RULES,
      icon: <DownloadOutlined />,
      onClickHandler: importRecordsAction,
      trackClickEvent: () => {
        trackUploadRulesButtonClicked(SOURCE.RULES_LIST);
      },
    },
    {
      type: "primary",
      isTooltipShown: false,
      buttonText: "New Rule",
      icon: <MdAdd className="anticon" />,
      onClickHandler: createRuleAction,
      isDropdown: true,
      overlay: (
        <div className="rules-dropdown-items-container">
          <RuleSelectionList source="rule_dropdown" />
        </div>
      ),
    },
  ];

  const handleSearchValueUpdate = (value: string) => {
    setSearchValue(value);
    debouncedTrackRulesListSearched(value);
  };

  const contentHeaderActions = buttonData.map(
    (
      { icon, type = null, buttonText, isTooltipShown, onClickHandler, isDropdown = false, overlay, tourId = null },
      index
    ) => (
      <Tooltip key={index} title={isTooltipShown ? buttonText : null}>
        <>
          {isDropdown ? (
            // TODO: refactor this with common component RuleTypesDropdown
            <Dropdown
              trigger={["click"]}
              overlay={overlay}
              data-tour-id={tourId}
              className="rule-selection-dropdown-btn"
            >
              <Button type="primary" icon={icon} onClick={() => onClickHandler()}>
                {buttonText}
              </Button>
            </Dropdown>
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
              <Badge count={records.filter((record) => isRule(record)).length} overflowCount={10_000} />
            ) : null}
          </div>
        ),
        onClick: () => {
          setFilter("all");
          trackRulesListFilterApplied("all", records.length, records.length);
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
          // FIXME: 0 is not correct
          trackRulesListFilterApplied("pinned", records.length, 0);
        },
      },
      {
        key: "active",
        label: (
          <div className="label">
            <MdOutlineToggleOn className="icon" />
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
          // FIXME: 0 is not correct
          trackRulesListFilterApplied("active", records.length, 0);
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
