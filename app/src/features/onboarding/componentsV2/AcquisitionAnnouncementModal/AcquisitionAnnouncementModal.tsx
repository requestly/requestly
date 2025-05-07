import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { globalActions } from "store/slices/global/slice";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import LINKS from "config/constants/sub/links";
import { getIsAcquisitionAnnouncementModalVisible } from "store/selectors";
import { getUser } from "backend/user/getUser";
import "./acquisitionAnnouncementModal.scss";
import {
  trackAcquisitionAnnouncementModalClosed,
  trackAcquisitionAnnouncementModalViewed,
} from "features/onboarding/analytics";

export const AcquisitionAnnouncementModal = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isModalVisible = useSelector(getIsAcquisitionAnnouncementModalVisible);
  const [isUserDetailsLoading, setIsUserDetailsLoading] = useState(true);
  const isLoggedIn = user?.loggedIn;
  const uid = user?.details?.profile?.uid;

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (!uid) {
      return;
    }

    if (!isModalVisible) {
      return;
    }

    getUser(uid).then((user) => {
      if (user?.browserstackId) {
        dispatch(globalActions.updateIsAcquisitionAnnouncementModalVisible(false));
        return;
      }

      trackAcquisitionAnnouncementModalViewed();
      setIsUserDetailsLoading(false);
    });
  }, [uid, isLoggedIn, dispatch, isModalVisible]);

  const onCloseClick = () => {
    trackAcquisitionAnnouncementModalClosed();
    dispatch(globalActions.updateIsAcquisitionAnnouncementModalVisible(false));
  };

  if (!isLoggedIn) {
    return null;
  }

  if (isUserDetailsLoading) {
    return null;
  }

  return (
    <Modal
      open={isModalVisible}
      footer={null}
      closable={false}
      maskClosable={false}
      className="rq-acquisition-announcement-modal"
      maskStyle={{ background: "rgba(0, 0, 0, 0.7)" }}
    >
      <div className="rq-acquisition-announcement-modal__header">
        <RQButton
          type="transparent"
          icon={<MdClose />}
          onClick={onCloseClick}
          className="rq-acquisition-announcement-modal__close-btn"
        />
        <img
          width={88}
          height={24}
          alt="Requestly by BrowserStack"
          src={"/assets/media/onboarding/rq_x_bs_logo.svg"}
          className="rq-acquisition-announcement-modal__logo"
        />
        <div className="rq-acquisition-announcement-modal__title">Requestly joins BrowserStack!</div>
      </div>

      <div className="rq-acquisition-announcement-modal__content">
        <div className="rq-acquisition-announcement-modal__description">
          And we would like to thank you! Yes, you personally, and you collectively as our customers. Requestly is a
          result of your ongoing input and your love. <br />
          <br />
          We're really excited about the future of Requestly within BrowserStack and hope to bring the tool not only to
          more users, but also make the product better for existing ones.
          <br /> <br />
          Thank you from the bottom of our hearts,
          <br />
          Requestly Team
          <br />
        </div>

        <a className="rq-acquisition-announcement-modal__know-more-link" href={LINKS.ACQUISITION_DETAILS}>
          Know more <MdOutlineOpenInNew />
        </a>
      </div>
    </Modal>
  );
};
