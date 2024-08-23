import { useDispatch, useSelector } from "react-redux";
import { MdKeyboardArrowLeft } from "@react-icons/all-files/md/MdKeyboardArrowLeft";
import { MdKeyboardArrowRight } from "@react-icons/all-files/md/MdKeyboardArrowRight";
import { getIsSecondarySidebarCollapsed } from "store/selectors";
import { actions } from "store";
import { trackSecondarySidebarToggleButtonClicked } from "componentsV2/SecondarySidebar/analytics";
import "./sidebarToggleButton.scss";

export const SidebarToggleButton = () => {
  const isSecondarySidebarCollapsed = useSelector(getIsSecondarySidebarCollapsed);
  const dispatch = useDispatch();

  return (
    <>
      <div
        className="secondary-sidebar-toggle-btn"
        onClick={() => {
          dispatch(actions.updateSecondarySidebarCollapse(!isSecondarySidebarCollapsed));
          trackSecondarySidebarToggleButtonClicked(isSecondarySidebarCollapsed);
        }}
      >
        {isSecondarySidebarCollapsed ? <MdKeyboardArrowRight /> : <MdKeyboardArrowLeft />}
      </div>
    </>
  );
};
