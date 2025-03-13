import { CgStack } from "@react-icons/all-files/cg/CgStack";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTabs, tabsLayoutActions } from "store/slices/tabs-layout";
import { isEmpty } from "lodash";
import { useCallback, useState } from "react";
import { getOptions } from "./utils";
import { FormatType } from "./types";
import { TabsLayout } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import { PRODUCT_FEATURES } from "../EmptyCard/staticData";
import { MdOutlineSyncAlt } from "@react-icons/all-files/md/MdOutlineSyncAlt";
import DropdownButton from "antd/lib/dropdown/dropdown-button";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import "./apiClientCard.scss";
import { Card } from "../Card";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { CardType } from "../Card/types";
import { ApiClientImporterType } from "features/apiClient/types";
import Postman from "../../../../assets/img/brand/postman-icon.svg?react";
import { CreateType } from "features/apiClient/types";
import { trackHomeApisActionClicked } from "components/Home/analytics";
import { RoleBasedComponent, useRBAC } from "features/rbac";

interface CardOptions {
  contentList: TabsLayout.Tab[];
  bodyTitle: string;
  type: FormatType;
}

const ApiClientCard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isLoggedIn = user?.details?.isLoggedIn;
  const tabs = useSelector(getTabs("apiClient"));
  const [cardOptions] = useState<CardOptions>(!isEmpty(tabs) ? getOptions(tabs, FormatType.TABS) : null);
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");

  const createNewHandler = useCallback(
    (type: CreateType) => {
      navigate(PATHS.API_CLIENT.ABSOLUTE, { state: { action: "create", type } });
      trackHomeApisActionClicked(`new_${type}_clicked`);
    },
    [navigate]
  );

  const importTriggerHandler = useCallback(
    (modal: ApiClientImporterType) => {
      navigate(PATHS.API_CLIENT.ABSOLUTE, user?.details?.isLoggedIn ? { state: { modal } } : {});
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
      label: "Requestly",
      icon: <img src={"/assets/img/brandLogos/requestly-icon.svg"} alt="Requestly" />,
      onClick: () => importTriggerHandler(ApiClientImporterType.REQUESTLY),
    },
  ];

  return (
    <Card
      showFooter={isValidPermission}
      showActionButtons={isValidPermission}
      wrapperClass={`${cardOptions?.type === FormatType.HISTORY ? "history-card" : ""} api-client-card`}
      cardType={CardType.API_CLIENT}
      defaultImportClickHandler={() => importTriggerHandler(ApiClientImporterType.REQUESTLY)}
      title={"API Client"}
      cardIcon={"/assets/media/apiClient/api-client-icon.svg"}
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
      actionButtons={
        <DropdownButton
          icon={<MdOutlineKeyboardArrowDown />}
          type="primary"
          overlayClassName="more-options"
          onClick={() => {
            createNewHandler(CreateType.API);
          }}
          menu={{ items }}
          trigger={["click"]}
        >
          {"New Request"}
        </DropdownButton>
      }
      listItemClickHandler={(item: TabsLayout.Tab) => {
        navigate(item.url);
        dispatch(tabsLayoutActions.setActiveTab({ featureId: "apiClient", tab: { ...item } }));
        trackHomeApisActionClicked("recent_tab_clicked");
      }}
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
              <div
                className="new-request-cta"
                onClick={() => {
                  navigate(PATHS.API_CLIENT.ABSOLUTE);
                }}
              >
                View and test APIs
              </div>
            }
          >
            <div
              className="new-request-cta"
              onClick={() => {
                navigate(PATHS.API_CLIENT.ABSOLUTE);
                trackHomeApisActionClicked("create/send_first_api");
              }}
            >
              <MdOutlineSyncAlt /> Create or test an API
            </div>
          </RoleBasedComponent>
        ),
      }}
    />
  );
};

export default ApiClientCard;
