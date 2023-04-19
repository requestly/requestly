import React, { useState, useCallback, useEffect } from "react";
import { CardBody } from "reactstrap";
import { Col, Row, Card, Button } from "antd";
// import { store } from "../../../store";
import { toast } from "utils/Toast.js";
import isEmpty from "is-empty";
//SUB COMPONENTS
import SpinnerCard from "../../misc/SpinnerCard";
//UTILS
import { getUserAuthDetails } from "../../../store/selectors";
//Firebase
import { getFunctions, httpsCallable } from "firebase/functions";
//CONSTANTS
import ProCard from "@ant-design/pro-card";
import ProTable from "@ant-design/pro-table";
import Jumbotron from "components/bootstrap-legacy/jumbotron";
import { useSelector } from "react-redux";

const ManageCompanyLicenseIndexPage = () => {
  //Global State
  const user = useSelector(getUserAuthDetails);

  //Component State
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [users, setUsers] = useState({});

  const getSigninStatus = () => {
    setIsLoading(true);
    if (user.loggedIn) {
      const functions = getFunctions();
      const getCompanyLicenseUsers = httpsCallable(functions, "getCompanyLicenseUsers");

      getCompanyLicenseUsers({}).then((result) => {
        setIsAdmin(result.data.success);
        setUsers(result.data.users ? result.data.users : {});
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  };

  const stableGetSignInStatus = useCallback(getSigninStatus, [user]);

  const handleRevoke = (userId) => {
    const email = users[userId].email;
    const functions = getFunctions();
    const revokeLicense = httpsCallable(functions, "revokeLicense");

    setIsRevoking(true);

    revokeLicense({ userId: userId }).then((result) => {
      setIsRevoking(false);
      setIsAdmin(result.data.success);
      setUsers(result.data.users ? result.data.users : {});

      toast.success(`Revoked ${email} License`);
    });
  };

  useEffect(() => {
    stableGetSignInStatus();
  }, [stableGetSignInStatus]);

  return (
    <React.Fragment>
      {isLoading ? (
        <SpinnerCard customLoadingMessage="Loading License Information" />
      ) : (
        <React.Fragment>
          <ProCard className="primary-card github-like-border" title="License Details">
            <Row>
              <Col span={24} align="center">
                <Card className="shadow">
                  <CardBody>
                    {isAdmin ? (
                      !isEmpty(users) ? (
                        <ProTable
                          options={false}
                          pagination={false}
                          search={false}
                          dateFormatter={false}
                          toolBarRender={false}
                          headerTitle={false}
                          rowKey="id"
                          dataSource={Object.keys(users).map((uid) => {
                            return {
                              id: uid,
                              ...users[uid],
                            };
                          })}
                          columns={[
                            {
                              title: "User Email",
                              dataIndex: "email",
                              // width: "40%",
                              textWrap: "word-break",
                              ellipsis: true,
                            },
                            {
                              title: "License Key",
                              dataIndex: "licenseKey",
                              // width: "40%",
                              textWrap: "word-break",
                              ellipsis: true,
                            },
                            {
                              title: "Actions",
                              align: "right",
                              render: (_, record) => {
                                return (
                                  <Button danger={true} onClick={(e) => handleRevoke(record.id)} loading={isRevoking}>
                                    Revoke Access
                                  </Button>
                                );
                              },
                              // width: "40%",
                              textWrap: "word-break",
                              ellipsis: true,
                            },
                          ]}
                        />
                      ) : (
                        <Jumbotron style={{ background: "transparent" }} className="text-center">
                          <p className="lead">There are no users using license keys.</p>
                        </Jumbotron>
                      )
                    ) : (
                      <Jumbotron style={{ background: "transparent" }} className="text-center">
                        <p className="lead">
                          Only the company admin can manage licenses. Please talk to your company admin if you want to
                          be added as an admin to your company.
                        </p>
                      </Jumbotron>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </ProCard>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
export default ManageCompanyLicenseIndexPage;
