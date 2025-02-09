import { CgStack } from "@react-icons/all-files/cg/CgStack";
import apiClientIcon from "./assets/api-client-icon.svg";
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
import { ImporterTypes } from "features/apiClient/types";
import Postman from "./assets/postman-icon.svg?react";
import rqIcon from "./assets/requestly-icon.svg";
import importIcon from "./assets/import-icon.svg";
import brunoIcon from "./assets/burno-icon.png";
import { CreateType } from "features/apiClient/types";
import { trackHomeApisActionClicked } from "components/Home/analytics";

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

  const createNewHandler = useCallback((type: CreateType) => {
    navigate(PATHS.API_CLIENT.ABSOLUTE, { state: { action: "create", type } });
    trackHomeApisActionClicked(`new_${type}_clicked`);
  }, []);

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
      onClick: () =>
        navigate(
          PATHS.API_CLIENT.ABSOLUTE,
          user?.details?.isLoggedIn ? { state: { modal: ImporterTypes.POSTMAN } } : {}
        ),
    },
    {
      key: "2",
      label: "Bruno",
      icon: <img src={brunoIcon} alt="Bruno" />,
      onClick: () =>
        navigate(PATHS.API_CLIENT.ABSOLUTE, user?.details?.isLoggedIn ? { state: { modal: ImporterTypes.BRUNO } } : {}),
    },
    {
      key: "3",
      label: "cURL",
      icon: <MdOutlineSyncAlt />,
      onClick: () =>
        navigate(PATHS.API_CLIENT.ABSOLUTE, user?.details?.isLoggedIn ? { state: { modal: ImporterTypes.CURL } } : {}),
    },
    {
      key: "4",
      label: "Requestly",
      icon: <img src={rqIcon} alt="Requestly" />,
      onClick: () =>
        navigate(
          PATHS.API_CLIENT.ABSOLUTE,
          user?.details?.isLoggedIn ? { state: { modal: ImporterTypes.REQUESTLY } } : {}
        ),
    },
  ];

  return (
    <Card
      wrapperClass={`${cardOptions?.type === FormatType.HISTORY ? "history-card" : ""} api-client-card`}
      cardType={CardType.API_CLIENT}
      title={"API Client"}
      cardIcon={apiClientIcon}
      importOptions={{ menu: IMPORT_OPTIONS, label: "Postman, Bruno & more", icon: importIcon }}
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
          <div
            className="new-request-cta"
            onClick={() => {
              navigate(PATHS.API_CLIENT.ABSOLUTE);
              trackHomeApisActionClicked("create/send_first_api");
            }}
          >
            <MdOutlineSyncAlt /> Create or test an API
          </div>
        ),
      }}
    />
  );
};

export default ApiClientCard;
