/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UsergroupAddOutlined } from "@ant-design/icons";
import ProCard from "@ant-design/pro-card";
import { Avatar, Button, Col, Row, Space, Table, Tooltip } from "antd";
import SpinnerCard from "components/misc/SpinnerCard";
import {
  getFirestore,
  collection,
  doc,
  orderBy,
  query as firebaseQuery,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  trackCreateTeamSubsClickedOnOrgsPage,
  trackMyOrgPageViewed,
  trackViewMoreUsersClicked,
} from "modules/analytics/events/misc/organization";
import { getUserAuthDetails } from "store/selectors";
import { generateGravatarURL } from "utils/ImageUtils";
import {
  redirectToCreateOrg,
  redirectToVerifyEmail,
} from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import firebaseApp from "../../../firebase";
import Logger from "lib/logger";

const columns = [
  {
    title: "",
    dataIndex: "email",
    key: "id",
    render: (email) => (
      <center>
        <Avatar
          size={36}
          src={generateGravatarURL(email)}
          className="hp-mr-8 hp-bg-color-primary-3"
          alt={email}
        />
      </center>
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Action",
    key: "id",
    render: (text, record) => (
      <Space size="large">
        <Tooltip title="Coming soon!">
          <a>Add to team</a>
        </Tooltip>
        <Tooltip title="Coming soon!">
          <a>Delete</a>
        </Tooltip>
      </Space>
    ),
  },
];

const MyOrganization = () => {
  const mountedRef = useRef(true);
  const navigate = useNavigate();
  trackMyOrgPageViewed();

  //GLOBAL STATE
  const user = useSelector(getUserAuthDetails);

  // Component State
  const [companyName, setCompanyName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompanyNameLoading, setIsCompanyNameLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [qs, setQs] = useState(null);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [users, setUsers] = useState([]);

  const hasSelected = selectedRowKeys.length > 0;

  const fetchUsers = (lastDoc) => {
    let userEmail;
    let domain;
    try {
      userEmail = user.details.profile.email;
      domain = userEmail.substring(userEmail.lastIndexOf("@") + 1);
    } catch (error) {
      return;
    }
    setIsLoading(true);
    let records = [];

    const db = getFirestore(firebaseApp);
    const collectionRef = collection(
      doc(collection(db, "companies"), domain),
      "users"
    );

    let query = firebaseQuery(
      collectionRef,
      orderBy("email", "asc"),
      startAfter(lastDoc || null),
      limit(20)
    );

    getDocs(query)
      .then((documentSnapshots) => {
        if (!mountedRef.current) return null;
        if (documentSnapshots.empty) {
          setReachedEnd(true);
        } else {
          documentSnapshots.forEach((doc) => {
            records.push({
              id: doc.id,
              email: doc.data().email,
            });
          });
          if (records.length > 0) {
            setUsers((users) => users.concat(records));
            setQs(documentSnapshots);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => Logger.error(err));
  };

  const stableFetchUsers = useCallback(fetchUsers, [
    user.details.profile.email,
  ]);

  const submitCreateTeam = () => {
    trackCreateTeamSubsClickedOnOrgsPage();
    setIsLoading(true);
    const functions = getFunctions();
    const contactUsForm = httpsCallable(functions, "contactUsForm");

    contactUsForm({
      name: user.details.profile.displayName,
      email: user.details.profile.email,
      message: "From RQ Admin - Create Team Subscription",
    })
      .then(() => {
        setIsLoading(false);
        toast.success("Please check your email for status");
      })
      .catch(() => {
        setIsLoading(false);
        toast.error("Please check the details");
      });
  };

  useEffect(() => {
    stableFetchUsers();
    return () => {
      mountedRef.current = false;
    };
  }, [stableFetchUsers]);

  // Just to fetch company name
  useEffect(() => {
    if (user.details.isLoggedIn) {
      const functions = getFunctions();
      const isUserOrgTarget = httpsCallable(functions, "isUserOrgTarget");

      isUserOrgTarget({})
        .then((res) => {
          if (res && res.data && res.data.success) {
            if (res.data.count === undefined) {
              // count would be undefined if user's email is not verified
              redirectToVerifyEmail(navigate, {
                redirectURL: window.location.href,
              });
            }
            setCompanyName(res.data.companyName);
            setIsCompanyNameLoading(false);
          } else {
            redirectToCreateOrg(navigate);
          }
        })
        .catch((err) => {
          Logger.log("Error Code: Fioralba Gisilfrid");
          Logger.error(err);
          redirectToCreateOrg(navigate);
        });
    }
  }, [navigate, user.details.isLoggedIn]);

  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border">
        <Row>
          <Col span={24} align="center">
            {isCompanyNameLoading ? (
              <SpinnerCard />
            ) : (
              <Table
                title={() => (
                  <Row align="middle" justify="space-between">
                    <Col span={8} style={{ textAlign: "left" }}>
                      <span>
                        My Organization{" "}
                        {companyName ? <>- {companyName}</> : null}
                      </span>
                    </Col>
                    <Col span={8} style={{ textAlign: "right" }}>
                      {" "}
                      <span style={{ marginRight: 8 }}>
                        {hasSelected
                          ? `${selectedRowKeys.length} users selected`
                          : ""}
                      </span>
                      <Button
                        type="primary"
                        loading={isLoading}
                        icon={<UsergroupAddOutlined />}
                        onClick={submitCreateTeam}
                      >
                        Create Team Subscription
                      </Button>
                    </Col>
                  </Row>
                )}
                columns={columns}
                dataSource={users}
                rowKey="id"
                pagination={false}
                rowSelection={{
                  selectedRowKeys,
                  onChange: (newKeys) => setSelectedRowKeys(newKeys),
                }}
                footer={() => {
                  return (
                    <>
                      {reachedEnd ? (
                        <span>- End of list -</span>
                      ) : (
                        <Button
                          onClick={(e) => {
                            trackViewMoreUsersClicked();
                            fetchUsers(qs.docs[qs.docs.length - 1]);
                          }}
                          type="link"
                          size="small"
                        >
                          View More
                        </Button>
                      )}
                    </>
                  );
                }}
              />
            )}
          </Col>
        </Row>
      </ProCard>
    </React.Fragment>
  );
};

export default MyOrganization;
