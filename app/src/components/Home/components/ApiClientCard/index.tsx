import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import { SiOpenapiinitiative } from "@react-icons/all-files/si/SiOpenapiinitiative";
import { MenuProps } from "antd";
import DropdownButton from "antd/lib/dropdown/dropdown-button";
import { trackHomeApisActionClicked } from "components/Home/analytics";
import { useTabs } from "componentsV2/Tabs/slice";
import PATHS from "config/constants/sub/paths";
import { ApiClientImporterType, CreateType } from "features/apiClient/types";
import { RoleBasedComponent, useRBAC } from "features/rbac";
import { RQButton, RQTooltip } from "lib/design-system-v2/components";
import { isEmpty } from "lodash";
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import Postman from "../../../../assets/img/brand/postman-icon.svg?react";
import { Card } from "../Card";
import { CardListItem, CardType } from "../Card/types";
import { PRODUCT_FEATURES } from "../EmptyCard/staticData";
import "./apiClientCard.scss";
import { getOptions } from "./utils";

interface CardOptions {
  bodyTitle: string;
  contentList: CardListItem[];
}

const ApiClientCard = () => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const isLoggedIn = user?.details?.isLoggedIn;
  const tabs = useTabs();
  const cardOptions = useMemo<CardOptions | null>(
    () => (!isEmpty(tabs) ? getOptions(tabs) : null),
    [tabs]
  );
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const isOpenApiSupportEnabled = useFeatureIsOn("openapi-import-support");

  const createNewHandler = useCallback(
    (type: CreateType) => {
      navigate(PATHS.API_CLIENT.ABSOLUTE as string, { state: { action: "create", type } });
      trackHomeApisActionClicked(`new_${type}_clicked`);
    },
    [navigate]
  );

  const importTriggerHandler = useCallback(
    (modal: ApiClientImporterType) => {
      navigate(PATHS.API_CLIENT.ABSOLUTE as string, { state: { modal } });
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
      bodyTitle={cardOptions?.bodyTitle ?? ""}
      contentList={isLoggedIn ? cardOptions?.contentList ?? [] : []}
      listItemClickHandler={(item) => {
        if (item.url) {
          navigate(item.url as string);
          trackHomeApisActionClicked("recent_tab_clicked");
        }
      }}
      actionButtons={actionButtons}
      viewAllCta={"View all APIs"}
      viewAllCtaLink={PATHS.API_CLIENT.ABSOLUTE as string}
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
                  navigate(PATHS.API_CLIENT.ABSOLUTE as string);
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
