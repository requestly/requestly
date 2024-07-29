import { Layout } from "antd";
import HeaderUser from "layouts/DashboardLayout/MenuHeader/HeaderUser";
import RQLogo from "assets/img/brand/rq_logo_full.svg";
import "./index.scss";
import { redirectToRoot } from "utils/RedirectionUtils";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getActiveModals } from "store/selectors";
import AuthModal from "components/authentication/AuthModal";
import { actions } from "store";

const MinimalLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeModals = useSelector(getActiveModals);

  const toggleAuthModal = () => {
    // @ts-ignore
    dispatch(actions.toggleActiveModal({ modalName: "authModal" }));
  };

  return (
    <>
      {activeModals.authModal.isActive ? (
        <AuthModal
          isOpen={activeModals.authModal.isActive}
          toggle={() => toggleAuthModal()}
          {...activeModals.authModal.props}
        />
      ) : null}

      <Layout.Header className="minimal-layout-navbar">
        <img className="logo" src={RQLogo} alt="requestly logo" onClick={() => redirectToRoot(navigate)} />
        <HeaderUser />
      </Layout.Header>
      <Outlet />
    </>
  );
};

export default MinimalLayout;
