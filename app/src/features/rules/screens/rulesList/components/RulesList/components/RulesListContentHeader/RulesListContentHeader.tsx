import { DownloadOutlined } from "@ant-design/icons";
import { RiFolderAddLine } from "@react-icons/all-files/ri/RiFolderAddLine";
import { Badge, Dropdown, Tooltip } from "antd";
import AuthPopoverButton from "components/features/rules/RulesListContainer/RulesTable/AuthPopoverButtons";
import { ContentListHeader, ContentListHeaderProps, FilterType } from "componentsV2/ContentList";
import { RecordStatus, StorageRecord } from "@requestly/shared/types/entities/rules";
import { SOURCE } from "modules/analytics/events/common/constants";
import React, { useEffect, useMemo, useState } from "react";
import { isRule } from "features/rules/utils";
import { MdOutlinePushPin } from "@react-icons/all-files/md/MdOutlinePushPin";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { trackRulesImportStarted, trackUploadRulesButtonClicked } from "modules/analytics/events/features/rules";
import { useDebounce } from "hooks/useDebounce";
import { trackRulesListFilterApplied, trackRulesListSearched } from "features/rules/analytics";
import { useRulesActionContext } from "features/rules/context/actions";
import { MdOutlineToggleOn } from "@react-icons/all-files/md/MdOutlineToggleOn";
import { RuleSelectionList } from "../RuleSelectionList/RuleSelectionList";
import { useIsRedirectFromCreateRulesRoute } from "../../hooks/useIsRedirectFromCreateRulesRoute";
import { RQButton } from "lib/design-system-v2/components";
import { useLocation } from "react-router-dom";
import { useRBAC } from "features/rbac";

interface Props {
  searchValue: string;
  setSearchValue: (value: string) => void;
  filter: FilterType;
  records: StorageRecord[];
}

const RulesListContentHeader: React.FC<Props> = ({ searchValue, setSearchValue, filter, records }) => {
  const user = useSelector(getUserAuthDetails);
  const { state } = useLocation();
  const debouncedTrackRulesListSearched = useDebounce(trackRulesListSearched, 500);
  const isRedirectFromCreateRulesRoute = useIsRedirectFromCreateRulesRoute();
  const [isRuleDropdownOpen, setIsRuleDropdownOpen] = useState(isRedirectFromCreateRulesRoute || false);

  const { createRuleAction, createGroupAction, importRecordsAction } = useRulesActionContext();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("http_rule", "create");

  const buttonData = [
    {
      type: "transparent",
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
        trackRulesImportStarted();
        trackUploadRulesButtonClicked(SOURCE.RULES_LIST);
      },
    },
    {
      type: "primary",
      isTooltipShown: false,
      buttonText: "New Rule",
      icon: <MdAdd className="anticon" />,
      onClickHandler: () => {
        setIsRuleDropdownOpen((prev) => !prev);
        createRuleAction("in_app");
      },
      isDropdown: true,
      overlay: (
        <div className="rules-dropdown-items-container">
          <RuleSelectionList
            source="rule_dropdown"
            premiumIconSource="rule_dropdown"
            premiumPopoverPlacement="topLeft"
          />
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
              open={isRuleDropdownOpen}
              onOpenChange={(isOpen) => {
                setIsRuleDropdownOpen(isOpen);
              }}
              trigger={["click"]}
              overlay={overlay}
              data-tour-id={tourId}
              className="rule-selection-dropdown-btn"
              overlayStyle={{ zIndex: "1000" }}
            >
              <RQButton type="primary" icon={icon} onClick={() => onClickHandler()}>
                {buttonText}
              </RQButton>
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
          // FIXME: 0 is not correct
          trackRulesListFilterApplied("active", records.length, 0);
        },
      },
    ],
    [records]
  );

  useEffect(() => {
    if (state?.modal) {
      importRecordsAction();
    }
  }, [importRecordsAction, state?.modal]);

  return (
    <ContentListHeader
      title="My Rules"
      subtitle="Create and manage your rules from here"
      actions={isValidPermission ? contentHeaderActions : null}
      searchValue={searchValue}
      setSearchValue={handleSearchValueUpdate}
      filters={contentHeaderFilters}
    />
  );
};

export default RulesListContentHeader;
