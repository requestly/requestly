import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Col, Row, Radio, Tag, Space, Tooltip, Typography } from "antd";
import { AiOutlineLink } from "react-icons/ai";
import { Modal } from "antd";
import { toast } from "utils/Toast.js";
import { ReactMultiEmail, isEmail } from "react-multi-email";
import EditableTable from "./editableTable";
import { PostConfirmationModal } from "./PostConfirmationModal";
//UTILS
import {
  getAllRules,
  getAppMode,
  getGroupwiseRulesToPopulate,
  getUserAuthDetails,
} from "../../../../store/selectors";
import { unselectAllRules } from "../../rules/actions";

//ICONS
import { AiOutlineWarning } from "react-icons/ai";
import { EditFilled, ShareAltOutlined } from "@ant-design/icons";
import { IoEarthOutline } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";
import { BsBuilding } from "react-icons/bs";

import { Visibility } from "utils/sharedListUtils";

import {
  trackSharedListUrlCopied,
  trackSharedListRecipientAdded,
  trackSharedListVisibilityToggled,
} from "modules/analytics/events/features/sharedList";
import { trackRQLastActivity } from "../../../../utils/AnalyticsUtils";
import "./index.css";
import CopyButton from "components/misc/CopyButton";

const CreateSharedListModal = (props) => {
  const { toggle: toggleModal, isOpen, rulesToShare } = props;
  const rulesCount = rulesToShare.length;

  //Global State
  const dispatch = useDispatch();
  const rules = useSelector(getAllRules);
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const groupwiseRulesToPopulate = useSelector(getGroupwiseRulesToPopulate);

  //Component State
  const [createSharedListConfirmed, setCreateSharedListConfirmed] = useState(
    false
  );
  const [isSharedListCreated, setIsSharedListCreated] = useState(false);
  const [sharedListURL, setSharedListURL] = useState(null);
  const [permittedEmailsList, setPermittedEmailsList] = useState([]);
  const [sharedListRecipients, setSharedListRecipients] = useState([]);
  const [sharedListVisibility, setSharedListVisibility] = useState(
    Visibility.PUBLIC
  );
  const [copiedText, setCopiedText] = useState("");
  const [sharedListName, setSharedListName] = useState(() => {
    const rule =
      rulesCount === 1
        ? rules.find((rule) => rule.id === rulesToShare[0])
        : null;

    if (rule) {
      return rule.name;
    }

    const firstName = user.details.profile.displayName.split(" ")[0];
    const date = new Date().toLocaleDateString().split("/").join("-");
    const finalName = firstName + "-shared-list-" + date;
    return finalName;
  });

  const nameColumns = [
    {
      title: "Row Header",
      dataIndex: "RowHeader",
      width: "40",
      render: (data) => <b>{data}</b>,
    },
    {
      title: "Name",
      dataIndex: "name",
      width: "70%",
      editable: true,
      render: (data) => (
        <>
          {data}&nbsp;&nbsp;&nbsp;&nbsp;
          <Tooltip title="Edit Shared List Name">
            <EditFilled style={{ color: "#0095ff", cursor: "pointer" }} />
          </Tooltip>
        </>
      ),
    },
  ];
  const [nameDataSource, setNameDataSource] = useState([
    {
      key: "0",
      RowHeader: "List Name",
      name: sharedListName,
    },
  ]);

  const allOptions = [
    {
      key: Visibility.PUBLIC,
      label: "Anyone with the link",
    },
    {
      key: Visibility.CUSTOM,
      label: "Only with specific people",
    },
  ];

  const validateSharedListName = () => {
    //eslint-disable-next-line
    const specialCharacters = /[`!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?~]/;
    return specialCharacters.test(sharedListName);
  };

  const handlePostSharedListCreation = (url) => {
    setIsSharedListCreated(true);
    setSharedListURL(url);
  };

  const onCopyHandler = () => {
    trackSharedListUrlCopied("create_modal");
    trackRQLastActivity("sharedList_url_copied");
    setCopiedText(sharedListURL);
    navigator.clipboard.writeText(sharedListURL);
    setTimeout(() => {
      setCopiedText("");
    }, 700);
  };

  const getPrettyDescription = (visibility) => {
    switch (visibility) {
      case Visibility.PUBLIC:
        return "Anyone on the Internet with the link can import this list";
      case Visibility.CUSTOM:
        return "Only people listed below can open with the link";
      case Visibility.ORGANIZATION:
        return "Only people in your organization can access this list";

      default:
        return visibility;
    }
  };

  const renderHeroIcon = (currentVisibility, size = 16) => {
    switch (currentVisibility) {
      default:
      case Visibility.PUBLIC:
        return (
          <IoEarthOutline size={size} className="remix-icon radio-hero-icon" />
        );

      case Visibility.CUSTOM:
        return <FiUsers size={size} className="remix-icon radio-hero-icon" />;

      case Visibility.ORGANIZATION:
        return (
          <BsBuilding size={size} className="remix-icon radio-hero-icon" />
        );
    }
  };

  useEffect(() => {
    const newName = nameDataSource[0].name;
    setSharedListName((prevName) => {
      if (prevName !== newName) {
        setSharedListName(newName);
      }
      return newName;
    });
  }, [nameDataSource]);

  const renderModalFooter = (options) => {
    const { showConfirmationBtn } = options;
    return (
      <div
        className="modal-footer "
        style={{
          pointerEvents: "none",
          position: "sticky",
          bottom: "0",
          zIndex: "100",
        }}
      >
        {showConfirmationBtn ? (
          <>
            <br />
            <Button
              style={{ pointerEvents: "all" }}
              color="primary"
              data-dismiss="modal"
              type="primary"
            >
              Skip
            </Button>
            &nbsp;&nbsp;
            <Button
              style={{ pointerEvents: "all" }}
              color="primary"
              data-dismiss="modal"
              type="primary"
            >
              Create
            </Button>
          </>
        ) : null}
      </div>
    );
  };

  const renderPostConfirmationFooter = () => {
    return isSharedListCreated ? (
      <CopyButton
        copyText={sharedListURL}
        type="primary"
        title={"Copy Text"}
      />
    ) : null;
  };

  const handleVisibilityChange = (e) => {
    setSharedListVisibility(e.target.value);
    trackSharedListVisibilityToggled(e.target.value);
    // modifySharedList("visibility", e.target.value, createdSharedListId)
    //   .then((res) => {
    //     toast.success("Visibility updated successfully");
    //   })
    //   .catch((err) => {
    //     toast.error("Error updating visibility");
    //   });
  };

  const renderCreationSummary = () => {
    const handleAddRecipient = (recipients) => {
      setPermittedEmailsList(recipients);
      const newRecipients = recipients.map((recipient) => ({
        label: recipient,
        value: recipient,
      }));
      setSharedListRecipients(newRecipients);
      trackSharedListRecipientAdded();
    };

    return (
      <React.Fragment>
        <Row>
          <Col span={24}>
            <Radio.Group
              value={sharedListVisibility}
              onChange={handleVisibilityChange}
            >
              <Space direction="vertical">
                {allOptions.map((option) => {
                  return (
                    <Col
                      span={24}
                      className="radio-share-option"
                      key={option.key}
                    >
                      <Radio disabled={option.disabled} value={option.key}>
                        {renderHeroIcon(option.key)} {option.label}
                        {option.tag && (
                          <Tag style={{ marginLeft: "0.5rem" }}>
                            {option.tag}
                          </Tag>
                        )}
                      </Radio>
                      {sharedListVisibility === option.key && (
                        <div className="share-option-description">
                          <p className="hp-p1-body hp-text-color-black-60">
                            {getPrettyDescription(option.key)}
                          </p>
                        </div>
                      )}
                    </Col>
                  );
                })}
              </Space>
            </Radio.Group>
            {renderModalFooter({
              showConfirmationBtn: false,
              showNotifyBtn: true,
            })}
          </Col>
        </Row>
        {sharedListVisibility === Visibility.CUSTOM && (
          <Row
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Col align="center" span={24}>
              <ReactMultiEmail
                className="github-like-border restricted-users-input"
                placeholder="sam@amazon.com, tom@google.com"
                emails={permittedEmailsList}
                onChange={(email) => {
                  handleAddRecipient(email);
                }}
                validateEmail={(email) => {
                  return isEmail(email); // return boolean
                }}
                getLabel={(email, index, removeEmail) => {
                  return (
                    <div data-tag key={index}>
                      {email}
                      <span data-tag-handle onClick={() => removeEmail(index)}>
                        ×
                      </span>
                    </div>
                  );
                }}
              />
            </Col>
          </Row>
        )}

        <br />
        <EditableTable
          dataSource={nameDataSource}
          columns={nameColumns}
          setDataSource={setNameDataSource}
        />
      </React.Fragment>
    );
  };

  const renderWarningMessage = () => (
    <React.Fragment>
      <Row style={{ textAlign: "center" }}>
        <Col span={24}>
          <h1 className="display-2">
            <AiOutlineWarning />
          </h1>
          <h4>Please select a rule before sharing</h4>
          <br />
          <h4>Confused? See how this works!</h4>
          <iframe
            width="100%"
            height="300"
            src="https://www.youtube.com/embed/BM7kTFy-vdc"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </Col>
      </Row>

      {renderModalFooter({
        showConfirmationBtn: false,
        showNotifyBtn: false,
      })}
    </React.Fragment>
  );

  const handleSharedListCreation = () => {
    const isSharedListNameNotValid = validateSharedListName();
    if (isSharedListNameNotValid) {
      toast.error("Shared list name cannot have special characters");
    } else if (
      sharedListVisibility === Visibility.CUSTOM &&
      !sharedListRecipients.length
    ) {
      toast.error("Please add at least one recipient");
    } else {
      setCreateSharedListConfirmed(true);
    }
  };

  return (
    <div>
      <Modal
        className="modal-dialog-centered"
        open={isOpen}
        onCancel={() => {
          toggleModal();
          unselectAllRules(dispatch);
        }}
        footer={
          rulesToShare.length === 0 ? null : createSharedListConfirmed ? (
            <>{isSharedListCreated ? renderPostConfirmationFooter() : null}</>
          ) : (
            <Row justify="space-between">
              <div style={{ display: "flex", gap: "0.5rem" }}></div>
              <Button
                key="submit"
                type="primary"
                onClick={handleSharedListCreation}
              >
                {sharedListVisibility === Visibility.PUBLIC
                  ? "Generate Link"
                  : "Share"}
              </Button>
            </Row>
          )
        }
        title={
          <span>
            <ShareAltOutlined style={{ marginRight: 5 }} /> Share rules with
            others
          </span>
        }
      >
        {rulesToShare.length === 0 ? (
          renderWarningMessage()
        ) : (
          <>
            {createSharedListConfirmed ? (
              <PostConfirmationModal
                sharedListAttributes={{
                  appMode,
                  rulesToShare,
                  sharedListName,
                  groupwiseRulesToPopulate,
                  rulesCount,
                  sharedListVisibility,
                  sharedListRecipients,
                }}
                onSharedListCreation={handlePostSharedListCreation}
              />
            ) : (
              renderCreationSummary()
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default CreateSharedListModal;
