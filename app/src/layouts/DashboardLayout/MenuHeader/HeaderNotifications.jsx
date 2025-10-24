import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Badge, Row, Col, Dropdown, Divider, Avatar, Tag } from "antd";
import { CgDanger } from "@react-icons/all-files/cg/CgDanger";
import { IoMdNotificationsOutline } from "@react-icons/all-files/io/IoMdNotificationsOutline";
import moment from "moment";
import { groupBy } from "lodash";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { isEmailVerified, resendVerificationEmailHandler } from "utils/AuthUtils";
import Logger from "lib/logger";
const direction = "ltr";

const getNoticeData = (notices) => {
  if (!notices || notices.length === 0 || !Array.isArray(notices)) {
    return {};
  }

  const newNotices = notices.map((notice) => {
    const newNotice = { ...notice };

    if (newNotice.datetime) {
      newNotice.datetime = moment(notice.datetime).fromNow();
    }

    if (newNotice.id) {
      newNotice.key = newNotice.id;
    }

    if (newNotice.extra && newNotice.status) {
      const color = {
        todo: "",
        processing: "blue",
        urgent: "red",
        doing: "gold",
      }[newNotice.status];
      newNotice.extra = (
        <Tag
          color={color}
          style={{
            marginRight: 0,
          }}
        >
          {newNotice.extra}
        </Tag>
      );
    }

    return newNotice;
  });
  return groupBy(newNotices, "type");
};
const getUnreadData = (noticeData) => {
  const unreadMsg = {};
  Object.keys(noticeData).forEach((key) => {
    const value = noticeData[key];

    if (!unreadMsg[key]) {
      unreadMsg[key] = 0;
    }

    if (Array.isArray(value)) {
      unreadMsg[key] = value.filter((item) => !item.read).length;
    }
  });
  return unreadMsg;
};

export default function HeaderNotifications() {
  const notices = [];

  // Global State
  const user = useSelector(getUserAuthDetails);

  // Component State
  const [checkedEmail, setCheckedEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [isResendEmailLoading, setIsResendEmailLoading] = useState(false);

  useEffect(() => {
    const profile = user.details?.profile || user.details;
    if (user.loggedIn && !checkedEmail) {
      setCheckedEmail(true);
      isEmailVerified(profile.uid)
        .then((result) => {
          setEmailVerified(result);
        })
        .catch((err) => Logger.log(err));
    }
  }, [user.loggedIn, user.details, checkedEmail, setEmailVerified]);

  // Email Verification Notification
  if (!emailVerified) {
    const resendMailHandler = () => {
      setIsResendEmailLoading(true);
      resendVerificationEmailHandler({}).finally(() => setIsResendEmailLoading(false));
    };

    notices.push({
      // datetime: Date.now(),
      type: "notification",
      id: "verify-email",
      status: "urgent",
      // extra: "Something extra",
      title: "Verify Email",
      avatar: <CgDanger size={16} className="hp-text-color-warning-1" />,
      clickHandler: () => resendMailHandler(),
      description: <>{isResendEmailLoading ? <span>Sending...</span> : <span>Click here to resend</span>}</>,
    });
  }

  const noticeData = getNoticeData(notices);
  const unreadMsg = getUnreadData(noticeData || {});
  const notificationsCount = notices.length && notices.length >= 1 ? notices.length : 0;

  const renderNotificationItems = () => {
    return (
      <>
        <div className="hp-overflow-y-auto hp-px-10" style={{ maxHeight: 300, marginRight: -10, marginLeft: -10 }}>
          {/* <Divider className="hp-my-4" /> */}

          {noticeData.notification &&
            noticeData.notification.map((item) => {
              return (
                <Row
                  align="middle"
                  className="cursor-pointer hp-border-radius hp-transition hp-hover-bg-primary-4 hp-hover-bg-dark-80 hp-py-8 hp-px-10"
                  style={{ marginLeft: -10, marginRight: -10 }}
                  key={item.key}
                  onClick={item.clickHandler}
                >
                  <Col className="hp-mr-8">
                    <Avatar size={38} icon={item.avatar} className="hp-d-flex-center-full hp-bg-warning-4" />
                  </Col>

                  <Col>
                    <span className="hp-d-block hp-w-100 hp-mb-4 hp-font-weight-500 hp-p1-body">{item.title}</span>

                    <span className="hp-d-block hp-badge-text hp-font-weight-400 hp-text-color-black-60 hp-text-color-dark-40">
                      {item.description}
                    </span>
                  </Col>
                </Row>
              );
            })}
        </div>

        <Divider className="hp-my-4" />

        <Button
          type="text"
          block
          ghost
          className="hp-text-color-primary-1 hp-text-color-dark-primary-2 hp-fill-primary-1 hp-fill-dark-primary-2 hp-hover-bg-primary-4 hp-hover-bg-dark-80 hp-mt-4"
          icon={
            <svg
              className="hp-mr-10"
              width="15"
              height="14"
              viewBox="0 0 15 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.8335 3.00004H14.1668V4.33337H12.8335V13C12.8335 13.1769 12.7633 13.3464 12.6382 13.4714C12.5132 13.5965 12.3436 13.6667 12.1668 13.6667H2.8335C2.65669 13.6667 2.48712 13.5965 2.36209 13.4714C2.23707 13.3464 2.16683 13.1769 2.16683 13V4.33337H0.833496V3.00004H4.16683V1.00004C4.16683 0.82323 4.23707 0.65366 4.36209 0.528636C4.48712 0.403612 4.65669 0.333374 4.8335 0.333374H10.1668C10.3436 0.333374 10.5132 0.403612 10.6382 0.528636C10.7633 0.65366 10.8335 0.82323 10.8335 1.00004V3.00004ZM11.5002 4.33337H3.50016V12.3334H11.5002V4.33337ZM5.50016 6.33337H6.8335V10.3334H5.50016V6.33337ZM8.16683 6.33337H9.50016V10.3334H8.16683V6.33337ZM5.50016 1.66671V3.00004H9.50016V1.66671H5.50016Z" />
            </svg>
          }
          onClick={() => alert("Coming soon!")}
        >
          Clear all notifications
        </Button>
      </>
    );
  };

  const renderNoNotification = () => {
    return (
      <div style={{ maxHeight: 300, padding: "0 2px" }}>
        <span>All clear here!</span>
      </div>
    );
  };

  const notificationMenu = (
    <div className="notification-dropdown" style={{ width: 288 }}>
      <Row align="middle" justify="space-between" className="hp-mb-18">
        <Col>Notifications</Col>

        {notificationsCount > 0 && unreadMsg.notification && unreadMsg.notification > 0 ? (
          <Col style={{ padding: "0 2px" }}>{unreadMsg.notification} New</Col>
        ) : null}
      </Row>

      <Divider className="hp-my-4" />

      {noticeData?.notification?.length > 0 ? renderNotificationItems() : renderNoNotification()}
    </div>
  );

  return (
    <Col className="display-row-center">
      <Button
        type="text"
        icon={
          <Dropdown overlay={notificationMenu} placement="bottomRight">
            <div className="display-row-center">
              <div style={direction === "rtl" ? { left: -5, top: -5 } : { right: -5, top: -5 }}>
                {notificationsCount > 0 && unreadMsg.notification && unreadMsg.notification > 0 ? (
                  <Badge dot status="processing" />
                ) : null}
              </div>

              <IoMdNotificationsOutline />
            </div>
          </Dropdown>
        }
      />
    </Col>
  );
}
