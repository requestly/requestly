import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isEmpty } from "lodash";
import { useCallback, useState } from "react";
import { getOptions } from "./utils";
import PATHS from "config/constants/sub/paths";
import { PRODUCT_FEATURES } from "../EmptyCard/staticData";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import DropdownButton from "antd/lib/dropdown/dropdown-button";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { Card } from "../Card";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { CardListItem, CardType } from "../Card/types";
import { ApiClientImporterType } from "features/apiClient/types";
import Postman from "../../../../assets/img/brand/postman-icon.svg?react";
import { CreateType } from "features/apiClient/types";
import { trackHomeApisActionClicked } from "components/Home/analytics";
import { RoleBasedComponent, useRBAC } from "features/rbac";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { SiOpenapiinitiative } from "@react-icons/all-files/si/SiOpenapiinitiative";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import "./apiClientCard.scss";

interface CardOptions {
  bodyTitle: string;
  contentList: CardListItem[];
}

const ApiClientCard = () => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const isLoggedIn = user?.details?.isLoggedIn;
  const [tabs] = useTabServiceWithSelector((state) => [state.tabs]);
  const [cardOptions] = useState<CardOptions>(!isEmpty(tabs) ? getOptions(tabs) : null);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const isOpenApiSupportEnabled = useFeatureIsOn("openapi-import-support");

  const createNewHandler = useCallback(
    (type: CreateType) => {
      navigate(PATHS.API_CLIENT.ABSOLUTE, { state: { action: "create", type } });
      trackHomeApisActionClicked(`new_${type}_clicked`);
    },
    [navigate]
  );

  const importTriggerHandler = useCallback(
    (modal: ApiClientImporterType) => {
      navigate(PATHS.API_CLIENT.ABSOLUTE, { state: { modal } });
      trackHomeApisActionClicked(`${modal.toLowerCase()}_importer_clicked`);
    },
    [navigate]
  );

  const items: MenuProps["items"] = [
    {
      icon: <CgStack />,
      label: "Collection",
      key: "1",
      onClick: () => createNewHandler(CreateType.COLLECTION),
    },
    {
      icon: <MdHorizontalSplit />,
      label: "Environment",
      key: "2",
      onClick: () => createNewHandler(CreateType.ENVIRONMENT),
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: "Import cURL Request",
      icon: <MdOutlineSyncAlt />,
      onClick: () => importTriggerHandler(ApiClientImporterType.CURL),
    },
  ];

  const IMPORT_OPTIONS = [
    {
      key: "1",
      label: "Postman",
      icon: <Postman />,
      onClick: () => importTriggerHandler(ApiClientImporterType.POSTMAN),
    },
    {
      key: "2",
      label: "Bruno",
      icon: <img src={"/assets/img/brandLogos/bruno-icon.png"} alt="Bruno" />,
      onClick: () => importTriggerHandler(ApiClientImporterType.BRUNO),
    },
    {
      key: "3",
      label: "cURL",
      icon: <MdOutlineSyncAlt />,
      onClick: () => importTriggerHandler(ApiClientImporterType.CURL),
    },
    {
      key: "4",
      hidden: !isOpenApiSupportEnabled,
      label: "OpenAPI",
      icon: <SiOpenapiinitiative />,
      onClick: () => importTriggerHandler(ApiClientImporterType.OPENAPI),
    },
    {
      key: "5",
      label: "Requestly",
      icon: <img src={"/assets/img/brandLogos/requestly-icon.svg"} alt="Requestly" />,
      onClick: () => importTriggerHandler(ApiClientImporterType.REQUESTLY),
    },
  ];

  const actionButtons = (
    <RQTooltip
      showArrow={false}
      title={isValidPermission ? null : "Creating a new request is not allowed in view-only mode."}
    >
      <DropdownButton
        size="small"
        type="primary"
        disabled={!isValidPermission}
        icon={<MdOutlineKeyboardArrowDown />}
        overlayClassName="more-options"
        onClick={() => {
          createNewHandler(CreateType.API);
        }}
        menu={{ items }}
        trigger={["click"]}
      >
        {"New request"}
      </DropdownButton>
    </RQTooltip>
  );

  return (
    <Card
      cardType={CardType.API_CLIENT}
      showFooter={isValidPermission}
      wrapperClass={`api-client-card`}
      importOptions={
        isValidPermission
          ? {
              menu: IMPORT_OPTIONS,
              label: "Postman, Bruno & more",
              icon: "/assets/media/apiClient/import-icon.svg",
            }
          : null
      }
      bodyTitle={cardOptions?.bodyTitle}
      contentList={isLoggedIn ? cardOptions?.contentList : []}
      listItemClickHandler={(item) => {
        navigate(item.url);
        trackHomeApisActionClicked("recent_tab_clicked");
      }}
      actionButtons={actionButtons}
      viewAllCta={"View all APIs"}
      viewAllCtaLink={PATHS.API_CLIENT.ABSOLUTE}
      viewAllCtaOnClick={() => trackHomeApisActionClicked("view_all_apis")}
      emptyCardOptions={{
        ...PRODUCT_FEATURES.API_CLIENT,
        primaryAction: (
          <RoleBasedComponent
            resource="api_client_request"
            permission="create"
            fallback={
              <RQButton
                size="small"
                type="primary"
                onClick={() => {
                  navigate(PATHS.API_CLIENT.ABSOLUTE);
                }}
              >
                View requests
              </RQButton>
            }
          >
            <RQButton
              size="small"
              type="primary"
              onClick={() => {
                createNewHandler(CreateType.API);
              }}
            >
              New request
            </RQButton>
          </RoleBasedComponent>
        ),
      }}
    />
  );
};

export default ApiClientCard;
