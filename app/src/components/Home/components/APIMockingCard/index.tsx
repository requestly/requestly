import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { redirectToMockEditorEditMock, redirectToRuleEditor } from "utils/RedirectionUtils";
import PATHS from "config/constants/sub/paths";
import { globalActions } from "store/slices/global/slice";
import { trackHomeMockingActionClicked } from "components/Home/analytics";
import { trackRuleCreationWorkflowStartedEvent } from "modules/analytics/events/common/rules";
import { SOURCE } from "modules/analytics/events/common/constants";
import { ruleIcons } from "components/common/RuleIcon/ruleIcons";
import { Rule, RuleType } from "@requestly/shared/types/entities/rules";
import { PRODUCT_FEATURES } from "../EmptyCard/staticData";
import { Card } from "../Card";
import { CardListItem, CardType } from "../Card/types";
import { ImporterType } from "components/Home/types";
import { useRBAC } from "features/rbac";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { Dropdown, MenuProps } from "antd";
import { useHomeScreenContext } from "components/Home/contexts";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { IoDocumentTextOutline } from "@react-icons/all-files/io5/IoDocumentTextOutline";
import "./apiMockingCard.scss";

const APIMockingCardDropdownItem: React.FC<{ icon: string; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="api-mocking-card-importer-item">
      <div className="title-container">
        <img src={icon} alt={title} />
        <div className="title">{title}</div>
      </div>
      <div className="description">{description}</div>
    </div>
  );
};

export const APIMockingCard: React.FC = () => {
  const MAX_ITEMS_TO_SHOW = 5;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const { validatePermission } = useRBAC();
  const { isValidPermission: isValidPermissionForRules } = validatePermission("http_rule", "create");
  const { isValidPermission: isValidPermissionForMocks } = validatePermission("mock_api", "create");
  const isValidPermission = isValidPermissionForRules && isValidPermissionForMocks;

  const { rules, isRulesLoading, isFetchingMocks, mockRecords } = useHomeScreenContext();

  const responseRules = useMemo(() => {
    return rules.filter((rule: Rule) => rule.ruleType === RuleType.RESPONSE);
  }, [rules]);

  const records = useMemo(() => {
    return ([...responseRules, ...mockRecords] as (Rule | RQMockMetadataSchema)[])
      .map(
        (record): CardListItem => {
          if ("ruleType" in record) {
            return {
              id: record.id,
              title: record.name,
              icon: ruleIcons[record.ruleType as RuleType],
              type: record.ruleType,
              modificationDate: record.modificationDate,
              url: `${PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE}/${record.id}`,
            };
          }

          // mock
          return {
            id: record.id,
            title: record.name,
            icon: <IoDocumentTextOutline />,
            type: record.type,
            modificationDate: Number(record.updatedTs),
            url: `${PATHS.MOCK_SERVER_V2.EDIT.ABSOLUTE}/${record.id}`, // check navigation
          };
        }
      )
      ?.sort((a, b) => b.modificationDate - a.modificationDate)
      ?.slice(0, MAX_ITEMS_TO_SHOW + 1);
  }, [responseRules, mockRecords]);

  const importTriggerHandler = (modal: ImporterType.REQUESTLY | ImporterType.FILES): void => {
    if (!user?.details?.isLoggedIn) {
      dispatch(globalActions.toggleActiveModal({ modalName: "authModal", newValue: true }));
      return;
    }

    switch (modal) {
      case ImporterType.REQUESTLY: {
        trackHomeMockingActionClicked("rule_importer_clicked");
        navigate(PATHS.RULES.MY_RULES.ABSOLUTE, { state: { modal } });
        return;
      }
      case ImporterType.FILES: {
        trackHomeMockingActionClicked("mock_importer_clicked");
        navigate(PATHS.MOCK_SERVER.MY_MOCKS.ABSOLUTE, { state: { modal } });
        return;
      }
      default: {
        return null;
      }
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "0",
      label: (
        <APIMockingCardDropdownItem
          icon="/assets/media/home/modify-response.svg"
          title="Modify live API responses"
          description="Use “Modify API Response” feature to intercept & override API responses on the fly."
        />
      ),
      onClick: () => {
        trackHomeMockingActionClicked("create_response_rule");
        trackRuleCreationWorkflowStartedEvent(RuleType.RESPONSE, SOURCE.HOME_SCREEN);
        navigate(PATHS.RULE_EDITOR.CREATE_RULE.RESPONSE_RULE.ABSOLUTE, { state: { source: SOURCE.HOME_SCREEN } });
      },
    },
    {
      key: "1",
      label: (
        <APIMockingCardDropdownItem
          icon="/assets/media/home/create-mock.svg"
          title="Create Mock endpoints in Cloud"
          description="Use “File Server” feature to create a new Mock endpoint that serves the desired API responses."
        />
      ),
      onClick: () => {
        trackHomeMockingActionClicked("create_mock_endpoint");
        navigate(PATHS.MOCK_SERVER_V2.CREATE.ABSOLUTE, { state: { source: SOURCE.HOME_SCREEN } });
      },
    },
  ];

  const IMPORT_OPTIONS = [
    {
      key: "0",
      label: "Import rules",
      onClick: () => importTriggerHandler(ImporterType.REQUESTLY),
    },
    {
      key: "1",
      label: "Import mocks",
      onClick: () => importTriggerHandler(ImporterType.FILES),
    },
  ];

  const newMockDropdown = (
    <Dropdown
      disabled={!isValidPermission}
      placement="bottomRight"
      overlayClassName="more-options api-mocking-card-dropdown"
      menu={{ items }}
    >
      <RQTooltip
        showArrow={false}
        title={isValidPermission ? null : "Creating a new mock or a rule is not allowed in view-only mode."}
      >
        <RQButton type="primary" size="small">
          New mock
        </RQButton>
      </RQTooltip>
    </Dropdown>
  );

  return (
    <Card
      cardType={CardType.API_MOCKING}
      contentLoading={isRulesLoading || isFetchingMocks}
      showFooter={isValidPermission}
      importOptions={
        isValidPermission
          ? {
              menu: IMPORT_OPTIONS,
              label: "Requestly Rules and Mocks",
              icon: (
                <div className="api-mocking-import-icon">
                  <MdOutlineFileDownload />
                </div>
              ),
            }
          : null
      }
      actionButtons={newMockDropdown}
      bodyTitle="Recent rules and mocks"
      wrapperClass="api-mocking-card"
      contentList={records}
      listItemClickHandler={(item) => {
        if (item.type === RuleType.RESPONSE) {
          trackHomeMockingActionClicked("rule_clicked");
          redirectToRuleEditor(navigate, item.id, SOURCE.HOME_SCREEN);
        } else if (item.type === MockType.API) {
          trackHomeMockingActionClicked("mock_endpoint_clicked");
          redirectToMockEditorEditMock(navigate, item.id);
        }
      }}
      emptyCardOptions={{
        ...PRODUCT_FEATURES.API_MOCKING,
        primaryAction: newMockDropdown,
      }}
    />
  );
};
